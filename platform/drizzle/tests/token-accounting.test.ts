/**
 * Token-accounting invariant tests for the `tokenLots` reconciliation model.
 *
 * This repository has no test database, so the suite exercises a faithful
 * in-memory model of the mutation semantics documented in `src/schema.ts`
 * (bucket semantics + mutation assumptions 1-5) and asserts after EVERY
 * mutation that:
 *
 *   originalTokens = remainingTokens + lockedTokens
 *                  + (sum(consume) - sum(refund) - sum(release))
 *                  + sum(|expire|) + sum(|carry_forward < 0|)
 *                  + sum(base_tokens of unreleased schedule rows)
 *
 * holds, that the CHECK predicates `token_lots_token_range`,
 * `token_lots_lock_consistent` and `token_lots_lock_window_not_expired`
 * accept the state, and that every ledger row satisfies the
 * `token_transactions_amount_matches_type` sign rules.
 *
 * A final source-level block ties the model to the actual schema text so
 * drift in the documented identity or its constraints fails the suite.
 *
 * Run: `npm test` in platform/drizzle (node --test, no dependencies).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

/* ------------------------------ model ------------------------------ */

type TxType =
  | "grant"
  | "consume"
  | "release"
  | "refund"
  | "adjustment"
  | "lock"
  | "unlock"
  | "expire"
  | "carry_forward";

interface LedgerEntry {
  type: TxType;
  /** Signed amount, mirroring `token_transactions.amount` sign rules. */
  amount: number;
  /** Shared link for paired carry-forward rows (`referenceKey`). */
  referenceKey?: string;
}

interface ScheduleRow {
  weekIndex: number;
  baseTokens: number;
  /** null = unreleased; set once — mirrors the `releasedAt IS NULL` guard. */
  releasedAt: number | null;
}

interface LotState {
  id: string;
  originalTokens: number;
  remainingTokens: number;
  lockedTokens: number;
  lockedAt: number | null;
  lockExpiresAt: number | null;
  expiresAt: number | null;
  ledger: LedgerEntry[];
  schedule: ScheduleRow[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const LOCK_WINDOW_MS = 30 * DAY_MS; // mirrors `interval '30 days'`

let currentTime = 1_700_000_000_000;
const now = (): number => currentTime;
const tick = (ms: number): void => {
  currentTime += ms;
};

let lotSeq = 0;

/** Monthly allowance lot + complete weekly schedule (assumption 1: atomic). */
function createMonthlyLot(allowance: number, weeks: number): LotState {
  assert.ok(allowance > 0 && weeks > 0 && allowance % weeks === 0);
  const base = allowance / weeks;
  return {
    id: `lot-${++lotSeq}`,
    originalTokens: allowance,
    remainingTokens: 0,
    lockedTokens: 0,
    lockedAt: null,
    lockExpiresAt: null,
    expiresAt: now() + 28 * DAY_MS,
    ledger: [],
    schedule: Array.from({ length: weeks }, (_, weekIndex) => ({
      weekIndex,
      baseTokens: base,
      releasedAt: null,
    })),
  };
}

/** Renewed period's lot: ceiling and balance initialized with carry-in. */
function createRenewedLot(allowance: number, weeks: number, carryIn: number): LotState {
  const lot = createMonthlyLot(allowance, weeks);
  lot.originalTokens = allowance + carryIn; // assumption 2
  lot.remainingTokens = carryIn; // initialized, not ledger-driven
  return lot;
}

/** Purchased top-up: initialized balance + audit-only grant record. */
function createTopupLot(purchased: number): LotState {
  assert.ok(purchased > 0);
  return {
    id: `lot-${++lotSeq}`,
    originalTokens: purchased,
    remainingTokens: purchased,
    lockedTokens: 0,
    lockedAt: null,
    lockExpiresAt: null,
    expiresAt: null, // top-ups never expire
    ledger: [{ type: "grant", amount: purchased }],
    schedule: [],
  };
}

/* --------------------------- mutations --------------------------- */

/** Weekly scheduled/early release: R += base, row -> released, ledger grant. */
function releaseWeek(lot: LotState, weekIndex: number): void {
  const row = lot.schedule[weekIndex];
  assert.ok(row, `no schedule row for week ${weekIndex}`);
  assert.equal(row.releasedAt, null, "release must be exactly-once (releasedAt IS NULL guard)");
  row.releasedAt = now();
  lot.remainingTokens += row.baseTokens;
  lot.ledger.push({ type: "grant", amount: row.baseTokens });
}

function consume(lot: LotState, tokens: number): void {
  assert.ok(tokens > 0);
  assert.ok(lot.remainingTokens >= tokens, "cannot spend more than remaining");
  lot.remainingTokens -= tokens;
  lot.ledger.push({ type: "consume", amount: -tokens });
}

/** Consumption reversal (refund of committed usage). */
function refund(lot: LotState, tokens: number): void {
  assert.ok(tokens > 0);
  lot.remainingTokens += tokens;
  lot.ledger.push({ type: "refund", amount: tokens });
}

/** Reservation release (returns previously deducted tokens). */
function releaseReversal(lot: LotState, tokens: number): void {
  assert.ok(tokens > 0);
  lot.remainingTokens += tokens;
  lot.ledger.push({ type: "release", amount: tokens });
}

/** Paid-access end: move ALL remaining tokens into the locked bucket. */
function lock(lot: LotState): void {
  assert.equal(lot.lockedAt, null, "lot already locked");
  const amount = lot.remainingTokens;
  lot.remainingTokens -= amount;
  lot.lockedTokens += amount;
  lot.lockedAt = now();
  lot.lockExpiresAt = lot.lockedAt + LOCK_WINDOW_MS;
  // `token_lots_lock_window_not_expired`: extend expiry to the deadline.
  if (lot.expiresAt !== null) lot.expiresAt = Math.max(lot.expiresAt, lot.lockExpiresAt);
  if (amount > 0) lot.ledger.push({ type: "lock", amount: -amount });
}

/** Reactivation within the 30-day window: move the whole locked bucket back. */
function unlock(lot: LotState): void {
  assert.notEqual(lot.lockedAt, null, "lot is not locked");
  assert.ok(lot.lockExpiresAt !== null && now() < lot.lockExpiresAt, "reactivation window has closed");
  const amount = lot.lockedTokens;
  lot.lockedTokens -= amount;
  lot.remainingTokens += amount;
  lot.lockedAt = null;
  lot.lockExpiresAt = null;
  if (amount > 0) lot.ledger.push({ type: "unlock", amount });
}

/** Deadline reached: destroy the locked bucket (assumption 4). */
function expireLocked(lot: LotState): void {
  assert.notEqual(lot.lockedAt, null, "lot is not locked");
  assert.ok(lot.lockExpiresAt !== null && now() >= lot.lockExpiresAt, "expiry only after the 30-day window");
  const amount = lot.lockedTokens;
  lot.lockedTokens -= amount;
  if (amount > 0) lot.ledger.push({ type: "expire", amount: -amount });
}

/**
 * Renewal carry-forward. Source debit is guarded; destination balance was
 * already initialized (createRenewedLot), so the `:in` row is an audit
 * record only — no balance mutation happens here for either side beyond the
 * guarded source debit.
 */
function carryForward(source: LotState, destination: LotState, tokens: number): void {
  assert.ok(tokens > 0);
  assert.ok(source.remainingTokens >= tokens, "guard: source remainingTokens >= carryIn");
  const referenceKey = `carry:${source.id}:${destination.id}`;
  source.remainingTokens -= tokens;
  source.ledger.push({ type: "carry_forward", amount: -tokens, referenceKey });
  destination.ledger.push({ type: "carry_forward", amount: tokens, referenceKey });
}

/** Out-of-schedule credit (assumption 3): ceiling rises with the credit. */
function adjust(lot: LotState, tokens: number): void {
  assert.ok(tokens > 0);
  lot.originalTokens += tokens;
  lot.remainingTokens += tokens;
  lot.ledger.push({ type: "adjustment", amount: tokens });
}

/* --------------------------- invariants --------------------------- */

function reconcile(lot: LotState): number {
  const sum = (f: (e: LedgerEntry) => number): number =>
    lot.ledger.reduce((acc, e) => acc + f(e), 0);
  const netConsumed = sum((e) =>
    e.type === "consume" || e.type === "refund" || e.type === "release" ? -e.amount : 0,
  );
  const expired = sum((e) => (e.type === "expire" ? Math.abs(e.amount) : 0));
  const carriedOut = sum((e) =>
    e.type === "carry_forward" && e.amount < 0 ? Math.abs(e.amount) : 0,
  );
  const unreleased = lot.schedule
    .filter((r) => r.releasedAt === null)
    .reduce((acc, r) => acc + r.baseTokens, 0);
  return lot.remainingTokens + lot.lockedTokens + netConsumed + expired + carriedOut + unreleased;
}

/** Mirror of CHECK `token_lots_token_range`. */
function checkTokenRange(lot: LotState): void {
  assert.ok(lot.originalTokens >= 0, "originalTokens >= 0");
  assert.ok(lot.remainingTokens >= 0, "remainingTokens >= 0");
  assert.ok(lot.lockedTokens >= 0, "lockedTokens >= 0");
  assert.ok(
    lot.remainingTokens + lot.lockedTokens <= lot.originalTokens,
    `range violated: ${lot.remainingTokens}+${lot.lockedTokens} > ${lot.originalTokens}`,
  );
}

/** Mirror of CHECK `token_lots_lock_consistent`. */
function checkLockConsistent(lot: LotState): void {
  if (lot.lockedAt === null) {
    assert.equal(lot.lockExpiresAt, null, "lockExpiresAt must be null when unlocked");
    assert.equal(lot.lockedTokens, 0, "lockedTokens must be 0 when unlocked");
  } else {
    assert.ok(lot.lockExpiresAt !== null, "locked lot requires lockExpiresAt");
    assert.equal(lot.lockExpiresAt - lot.lockedAt, LOCK_WINDOW_MS, "lock window must be exactly 30 days");
    assert.ok(lot.lockedTokens >= 0);
  }
}

/** Mirror of CHECK `token_lots_lock_window_not_expired`. */
function checkLockWindowNotExpired(lot: LotState): void {
  if (lot.lockedAt !== null && lot.expiresAt !== null) {
    assert.ok(lot.expiresAt >= (lot.lockExpiresAt ?? 0), "locked lot must not expire before the deadline");
  }
}

/** Mirror of CHECK `token_transactions_amount_matches_type` + nonzero. */
function checkSignRules(lot: LotState): void {
  const positive = new Set<TxType>(["grant", "release", "refund", "adjustment", "unlock"]);
  const negative = new Set<TxType>(["consume", "lock", "expire"]);
  for (const e of lot.ledger) {
    assert.notEqual(e.amount, 0, "amount must be non-zero");
    if (positive.has(e.type)) assert.ok(e.amount > 0, `${e.type} must be positive, got ${e.amount}`);
    else if (negative.has(e.type)) assert.ok(e.amount < 0, `${e.type} must be negative, got ${e.amount}`);
    else assert.ok(e.amount !== 0, "carry_forward must be non-zero");
  }
}

function assertInvariants(lot: LotState, context: string): void {
  assert.equal(
    reconcile(lot),
    lot.originalTokens,
    `identity broken at [${context}]: reconcile=${reconcile(lot)} original=${lot.originalTokens}`,
  );
  checkTokenRange(lot);
  checkLockConsistent(lot);
  checkLockWindowNotExpired(lot);
  checkSignRules(lot);
}

/* ------------------------------ tests ------------------------------ */

test("required case: 1,000-token lot with 200 consumed leaves 800 and reconciles", () => {
  const lot = createMonthlyLot(1000, 1);
  assertInvariants(lot, "creation");
  releaseWeek(lot, 0);
  assert.equal(lot.remainingTokens, 1000);
  assertInvariants(lot, "weekly release");
  consume(lot, 200);
  assert.equal(lot.remainingTokens, 800);
  assertInvariants(lot, "consumption");
  assert.equal(reconcile(lot), 1000);
});

test("refunds and release-reversals net against consumption", () => {
  const lot = createMonthlyLot(1000, 1);
  releaseWeek(lot, 0);
  consume(lot, 200); // remaining 800, net 200
  refund(lot, 100); // remaining 900, net 100
  assertInvariants(lot, "refund");
  releaseReversal(lot, 50); // remaining 950, net 50
  assertInvariants(lot, "release reversal");
  assert.equal(lot.remainingTokens, 950);
  // Documented requirement: reversals must not exceed prior consumption —
  // a violating sequence is rejected by the ceiling CHECK.
  assert.throws(() => {
    refund(lot, 1000); // would push remaining above the ceiling
    assertInvariants(lot, "over-refund must fail");
  }, /range violated/);
});

test("locking and unlocking move tokens between buckets without flows", () => {
  const lot = createMonthlyLot(1000, 1);
  releaseWeek(lot, 0);
  consume(lot, 200); // 800 spendable
  lock(lot);
  assert.equal(lot.remainingTokens, 0);
  assert.equal(lot.lockedTokens, 800);
  assertInvariants(lot, "locked");
  unlock(lot);
  assert.equal(lot.remainingTokens, 800);
  assert.equal(lot.lockedTokens, 0);
  assert.equal(lot.lockedAt, null);
  assertInvariants(lot, "unlocked");
  assert.equal(reconcile(lot), 1000, "lock/unlock must be flow-neutral");
});

test("expiry after the 30-day window zeroes the locked bucket; before it, unlock wins", () => {
  // Within window: unlock allowed.
  const a = createMonthlyLot(1000, 1);
  releaseWeek(a, 0);
  lock(a);
  tick(29 * DAY_MS);
  unlock(a);
  assertInvariants(a, "unlock within window");

  // Window closed: unlock rejected, expire path required.
  const b = createMonthlyLot(1000, 1);
  releaseWeek(b, 0);
  consume(b, 200); // 800 spendable
  lock(b);
  assert.ok(b.expiresAt !== null && b.expiresAt >= (b.lockExpiresAt ?? 0), "lock extended expiry to deadline");
  tick(31 * DAY_MS);
  assert.throws(() => unlock(b), /reactivation window has closed/);
  expireLocked(b);
  assert.equal(b.lockedTokens, 0);
  assertInvariants(b, "expired after 30 days");
  // 200 consumed + 800 expired = the original 1,000.
  assert.equal(reconcile(b), 1000);
});

test("weekly grants: partial releases, early unlock, and exactly-once", () => {
  const lot = createMonthlyLot(1000, 4); // 4 x 250
  const sumBases = lot.schedule.reduce((acc, r) => acc + r.baseTokens, 0);
  assert.ok(sumBases <= 1000, "schedule invariant: SUM(baseTokens) <= period allowance");
  assertInvariants(lot, "creation with full unreleased schedule");

  releaseWeek(lot, 0);
  assert.equal(lot.remainingTokens, 250);
  assertInvariants(lot, "week 0 released");
  releaseWeek(lot, 1);
  consume(lot, 100); // 400 spendable, net 100
  assertInvariants(lot, "week 1 + consumption");
  releaseWeek(lot, 2); // early unlock of the following week
  assert.equal(lot.remainingTokens, 650);
  assertInvariants(lot, "week 2 released early");
  assert.throws(() => releaseWeek(lot, 2), /exactly-once/);
  releaseWeek(lot, 3);
  assert.equal(lot.remainingTokens, 900);
  assertInvariants(lot, "all weeks released");
  assert.equal(reconcile(lot), 1000);
  assert.equal(
    lot.schedule.filter((r) => r.releasedAt !== null).length,
    4,
    "every schedule row released exactly once",
  );
});

test("renewal carry-forward: paired audit entries, no double-count", () => {
  const source = createMonthlyLot(1000, 1);
  releaseWeek(source, 0);
  consume(source, 200); // source: 800 unused
  assertInvariants(source, "source before renewal");

  const destination = createRenewedLot(500, 5, 800); // O = 1300, R = 800
  assertInvariants(destination, "destination initialized with carry-in");
  assert.equal(destination.remainingTokens, 800);

  const destBalanceBefore = destination.remainingTokens;
  carryForward(source, destination, 800);
  // Assumption 2: the :in row is an audit record — balances unchanged.
  assert.equal(destination.remainingTokens, destBalanceBefore, "destination balance must not be credited twice");
  assert.equal(source.remainingTokens, 0);
  assertInvariants(source, "source after carry-out");
  assertInvariants(destination, "destination after carry-in audit");

  const srcEntry = source.ledger.find((e) => e.type === "carry_forward");
  const dstEntry = destination.ledger.find((e) => e.type === "carry_forward");
  assert.ok(srcEntry && dstEntry, "paired entries exist");
  assert.equal(srcEntry.amount, -800);
  assert.equal(dstEntry.amount, 800);
  assert.equal(srcEntry.referenceKey, dstEntry.referenceKey, "shared referenceKey links the pair");

  assert.throws(() => carryForward(source, destination, 1), /source remainingTokens/);
});

test("out-of-schedule credits raise ceiling and balance together", () => {
  const lot = createMonthlyLot(1000, 1);
  releaseWeek(lot, 0);
  consume(lot, 300); // 700 spendable
  adjust(lot, 200); // goodwill credit: O 1200, R 900
  assert.equal(lot.originalTokens, 1200);
  assert.equal(lot.remainingTokens, 900);
  assertInvariants(lot, "adjustment");
  assert.equal(reconcile(lot), 1200);
});

test("purchased top-up lot: initialized balance, audit grant, no schedule", () => {
  const lot = createTopupLot(500);
  assert.equal(lot.schedule.length, 0);
  assertInvariants(lot, "topup creation (grant row is audit-only)");
  consume(lot, 150);
  assert.equal(lot.remainingTokens, 350);
  assertInvariants(lot, "topup consumption");
  assert.equal(reconcile(lot), 500);
});

/* ---------------- schema-source tie-in (drift guard) ---------------- */

const schemaSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "src", "schema.ts"),
  "utf8",
);

test("schema.ts documents the exact identity, sign rules, and constraints", () => {
  // The identity itself.
  assert.ok(schemaSource.includes("(sum(consume) - sum(refund) - sum(release))"));
  assert.ok(schemaSource.includes("sum(|expire|) + sum(|carry_forward < 0|)"));
  assert.ok(schemaSource.includes("sum(base_tokens of unreleased schedule rows)"));
  // Derivation notes guarding against term additions.
  assert.ok(schemaSource.includes("`lock`/`unlock` have no term"));
  assert.ok(schemaSource.includes("sum(refund) + sum(release) <= sum(consume)"));
  // CHECK predicates mirrored by this suite.
  assert.ok(
    schemaSource.includes("${t.remainingTokens} + ${t.lockedTokens} <= ${t.originalTokens}"),
    "token_lots_token_range predicate changed",
  );
  assert.ok(schemaSource.includes("'grant', 'release', 'refund', 'adjustment', 'unlock'"));
  assert.ok(schemaSource.includes("'consume', 'lock', 'expire'"));
  assert.ok(schemaSource.includes("'carry_forward' AND ${t.amount} <> 0"));
  assert.ok(schemaSource.includes("Expiry always debits the locked bucket"));
  assert.ok(schemaSource.includes("audit records of that already-applied"));
  assert.ok(schemaSource.includes("SUM(baseTokens) <= subscriptionPeriods.tokenAllowance"));
  assert.ok(schemaSource.includes("(allowance + carry-in + any out-of-schedule credits)"));
});

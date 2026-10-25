import {
  pgTable,
  pgEnum,
  uuid,
  text,
  char,
  bigint,
  integer,
  boolean,
  timestamp,
  jsonb,
  customType,
  inet,
  index,
  uniqueIndex,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * `bytea` has no dedicated column builder in drizzle-orm (not in 0.45.4, nor
 * in any newer release), so binary columns go through a customType shim. The
 * `pg` driver already maps Buffer <-> bytea, so no value conversion is needed.
 */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

/**
 * Splic Gateway — Drizzle ORM schema
 *
 * Notes:
 * - Monetary values are stored in the smallest currency unit (e.g. cents/paise).
 * - Token amounts and storage sizes use bigint mode "number"; keep values within
 *   JavaScript's safe-integer range, or change these columns to mode: "bigint".
 * - Cross-row invariants (e.g. order total equals sum of items) must also be
 *   enforced by transactional application logic.
 * - `updatedAt` is not automatically updated by PostgreSQL; update it in writes
 *   or add database triggers in a migration.
 */

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "deleted",
]);
export const oauthProviderEnum = pgEnum("oauth_provider", [
  "google",
  "microsoft",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "incomplete",
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "expired",
  "paused",
]);
export const tokenLotTypeEnum = pgEnum("token_lot_type", [
  "monthly_allowance",
  "purchased_topup",
]);
export const usageStatusEnum = pgEnum("usage_status", [
  "reserved",
  "committed",
  "failed",
  "reversed",
]);
export const tokenTransactionTypeEnum = pgEnum("token_transaction_type", [
  "grant",
  "consume",
  "release",
  "refund",
  "adjustment",
]);
export const storageObjectStatusEnum = pgEnum("storage_object_status", [
  "pending",
  "uploaded",
  "available",
  "deleting",
  "deleted",
  "failed",
]);
export const pluginEntitlementSourceEnum = pgEnum("plugin_entitlement_source", [
  "plan",
  "purchase",
  "promotion",
  "admin_grant",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "partially_refunded",
  "refunded",
]);
export const orderItemTypeEnum = pgEnum("order_item_type", [
  "editor_subscription",
  "storage_subscription",
  "plugin",
  "token_topup",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "authorized",
  "succeeded",
  "failed",
  "partially_refunded",
  "refunded",
]);
export const refundStatusEnum = pgEnum("refund_status", [
  "pending",
  "succeeded",
  "failed",
]);
export const webhookStatusEnum = pgEnum("webhook_status", [
  "pending",
  "processing",
  "processed",
  "failed",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized")
      .generatedAlwaysAs(sql`lower(trim(email))`)
      .notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    status: userStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    unique("users_email_normalized_unique").on(t.emailNormalized),
    check("users_email_not_blank", sql`length(trim(${t.email})) > 0`),
  ],
);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    provider: oauthProviderEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    providerEmail: text("provider_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("oauth_provider_account_unique").on(t.provider, t.providerAccountId),
    index("oauth_accounts_user_idx").on(t.userId),
  ],
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    refreshTokenHash: bytea("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    userAgent: text("user_agent"),
    ipAddress: inet("ip_address"),
  },
  (t) => [
    uniqueIndex("auth_sessions_refresh_hash_unique").on(t.refreshTokenHash),
    index("auth_sessions_user_active_idx")
      .on(t.userId, t.expiresAt)
      .where(sql`${t.revokedAt} IS NULL`),
  ],
);

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    monthlyPriceMinor: bigint("monthly_price_minor", {
      mode: "number",
    }).notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    monthlyTokenAllowance: bigint("monthly_token_allowance", {
      mode: "number",
    }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("plans_code_unique").on(t.code),
    check("plans_price_nonnegative", sql`${t.monthlyPriceMinor} >= 0`),
    check(
      "plans_token_allowance_nonnegative",
      sql`${t.monthlyTokenAllowance} >= 0`,
    ),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    provider: text("provider").notNull(),
    providerSubscriptionId: text("provider_subscription_id"),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("subscriptions_provider_id_unique").on(
      t.provider,
      t.providerSubscriptionId,
    ),
    index("subscriptions_user_status_idx").on(t.userId, t.status),
    check(
      "subscriptions_period_valid",
      sql`${t.currentPeriodEnd} > ${t.currentPeriodStart}`,
    ),
  ],
);

export const subscriptionPeriods = pgTable(
  "subscription_periods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "restrict" }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    tokenAllowance: bigint("token_allowance", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("subscription_period_start_unique").on(
      t.subscriptionId,
      t.periodStart,
    ),
    check("subscription_period_valid", sql`${t.periodEnd} > ${t.periodStart}`),
    check(
      "subscription_period_allowance_nonnegative",
      sql`${t.tokenAllowance} >= 0`,
    ),
  ],
);

export const storagePlans = pgTable(
  "storage_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    priceMinor: bigint("price_minor", { mode: "number" }).notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    quotaBytes: bigint("quota_bytes", { mode: "number" }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("storage_plans_code_unique").on(t.code),
    check("storage_plans_price_nonnegative", sql`${t.priceMinor} >= 0`),
    check("storage_plans_quota_nonnegative", sql`${t.quotaBytes} >= 0`),
  ],
);

export const storageSubscriptions = pgTable(
  "storage_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    storagePlanId: uuid("storage_plan_id")
      .notNull()
      .references(() => storagePlans.id, { onDelete: "restrict" }),
    provider: text("provider").notNull(),
    providerSubscriptionId: text("provider_subscription_id"),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("storage_subscriptions_provider_id_unique").on(
      t.provider,
      t.providerSubscriptionId,
    ),
    index("storage_subscriptions_user_status_idx").on(t.userId, t.status),
    check(
      "storage_subscriptions_period_valid",
      sql`${t.currentPeriodEnd} > ${t.currentPeriodStart}`,
    ),
  ],
);

export const plugins = pgTable(
  "plugins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    version: text("version").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("plugins_slug_unique").on(t.slug)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    orderNumber: text("order_number").notNull(),
    status: orderStatusEnum("status").notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull().default(0),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [
    unique("orders_order_number_unique").on(t.orderNumber),
    index("orders_user_created_idx").on(t.userId, t.createdAt.desc()),
    check("orders_subtotal_nonnegative", sql`${t.subtotalMinor} >= 0`),
    check("orders_discount_nonnegative", sql`${t.discountMinor} >= 0`),
    check("orders_tax_nonnegative", sql`${t.taxMinor} >= 0`),
    check("orders_total_nonnegative", sql`${t.totalMinor} >= 0`),
    check(
      "orders_total_matches_components",
      sql`${t.totalMinor} = ${t.subtotalMinor} - ${t.discountMinor} + ${t.taxMinor}`,
    ),
    check(
      "orders_discount_not_above_subtotal",
      sql`${t.discountMinor} <= ${t.subtotalMinor}`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    itemType: orderItemTypeEnum("item_type").notNull(),
    planId: uuid("plan_id").references(() => plans.id, {
      onDelete: "restrict",
    }),
    storagePlanId: uuid("storage_plan_id").references(() => storagePlans.id, {
      onDelete: "restrict",
    }),
    pluginId: uuid("plugin_id").references(() => plugins.id, {
      onDelete: "restrict",
    }),
    quantity: integer("quantity").notNull().default(1),
    unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    currency: char("currency", { length: 3 }).notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
    check("order_items_unit_price_nonnegative", sql`${t.unitPriceMinor} >= 0`),
    check("order_items_discount_nonnegative", sql`${t.discountMinor} >= 0`),
    check(
      "order_items_type_target_consistent",
      sql`
    (${t.itemType} = 'editor_subscription' AND ${t.planId} IS NOT NULL AND ${t.storagePlanId} IS NULL AND ${t.pluginId} IS NULL)
    OR (${t.itemType} = 'storage_subscription' AND ${t.storagePlanId} IS NOT NULL AND ${t.planId} IS NULL AND ${t.pluginId} IS NULL)
    OR (${t.itemType} = 'plugin' AND ${t.pluginId} IS NOT NULL AND ${t.planId} IS NULL AND ${t.storagePlanId} IS NULL)
    OR (${t.itemType} = 'token_topup' AND ${t.planId} IS NULL AND ${t.storagePlanId} IS NULL AND ${t.pluginId} IS NULL)
  `,
    ),
  ],
);

export const tokenLots = pgTable(
  "token_lots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    lotType: tokenLotTypeEnum("lot_type").notNull(),
    subscriptionPeriodId: uuid("subscription_period_id").references(
      () => subscriptionPeriods.id,
      { onDelete: "restrict" },
    ),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "restrict",
    }),
    originalTokens: bigint("original_tokens", { mode: "number" }).notNull(),
    remainingTokens: bigint("remaining_tokens", { mode: "number" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("token_lots_subscription_period_unique").on(t.subscriptionPeriodId),
    unique("token_lots_order_item_unique").on(t.orderItemId),
    index("token_lots_spendable_idx")
      .on(t.userId, t.expiresAt, t.createdAt)
      .where(sql`${t.remainingTokens} > 0`),
    check(
      "token_lots_token_range",
      sql`${t.originalTokens} >= 0 AND ${t.remainingTokens} >= 0 AND ${t.remainingTokens} <= ${t.originalTokens}`,
    ),
    check(
      "token_lots_type_target_consistent",
      sql`
    (${t.lotType} = 'monthly_allowance' AND ${t.subscriptionPeriodId} IS NOT NULL AND ${t.orderItemId} IS NULL AND ${t.expiresAt} IS NOT NULL)
    OR (${t.lotType} = 'purchased_topup' AND ${t.subscriptionPeriodId} IS NULL AND ${t.orderItemId} IS NOT NULL)
  `,
    ),
  ],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    requestKey: text("request_key").notNull(),
    operation: text("operation").notNull(),
    status: usageStatusEnum("status").notNull(),
    tokensReserved: bigint("tokens_reserved", { mode: "number" })
      .notNull()
      .default(0),
    tokensActual: bigint("tokens_actual", { mode: "number" }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    unique("usage_events_user_request_unique").on(t.userId, t.requestKey),
    index("usage_events_user_created_idx").on(t.userId, t.createdAt.desc()),
    check("usage_events_reserved_nonnegative", sql`${t.tokensReserved} >= 0`),
    check(
      "usage_events_actual_nonnegative",
      sql`${t.tokensActual} IS NULL OR ${t.tokensActual} >= 0`,
    ),
  ],
);

export const tokenTransactions = pgTable(
  "token_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    tokenLotId: uuid("token_lot_id")
      .notNull()
      .references(() => tokenLots.id, { onDelete: "restrict" }),
    usageEventId: uuid("usage_event_id").references(() => usageEvents.id, {
      onDelete: "restrict",
    }),
    transactionKey: text("transaction_key").notNull(),
    transactionType: tokenTransactionTypeEnum("transaction_type").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("token_transactions_key_unique").on(t.transactionKey),
    index("token_transactions_user_created_idx").on(
      t.userId,
      t.createdAt.desc(),
    ),
    index("token_transactions_lot_created_idx").on(t.tokenLotId, t.createdAt),
    check("token_transactions_amount_nonzero", sql`${t.amount} <> 0`),
    check(
      "token_transactions_amount_matches_type",
      sql`
    (${t.transactionType} IN ('grant', 'release', 'refund', 'adjustment') AND ${t.amount} > 0)
    OR (${t.transactionType} = 'consume' AND ${t.amount} < 0)
  `,
    ),
  ],
);

export const storageObjects = pgTable(
  "storage_objects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    objectKey: text("object_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    checksumSha256: text("checksum_sha256"),
    status: storageObjectStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    unique("storage_objects_key_unique").on(t.objectKey),
    index("storage_objects_user_status_idx")
      .on(t.userId, t.status)
      .where(sql`${t.deletedAt} IS NULL`),
    check("storage_objects_size_nonnegative", sql`${t.sizeBytes} >= 0`),
  ],
);

export const pluginEntitlements = pgTable(
  "plugin_entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    pluginId: uuid("plugin_id")
      .notNull()
      .references(() => plugins.id, { onDelete: "restrict" }),
    source: pluginEntitlementSourceEnum("source").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("plugin_entitlements_user_plugin_active_idx")
      .on(t.userId, t.pluginId)
      .where(sql`${t.revokedAt} IS NULL`),
    check(
      "plugin_entitlements_period_valid",
      sql`${t.expiresAt} IS NULL OR ${t.expiresAt} > ${t.startsAt}`,
    ),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id"),
    status: paymentStatusEnum("status").notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    succeededAt: timestamp("succeeded_at", { withTimezone: true }),
  },
  (t) => [
    unique("payments_provider_payment_unique").on(
      t.provider,
      t.providerPaymentId,
    ),
    index("payments_order_idx").on(t.orderId),
    check("payments_amount_nonnegative", sql`${t.amountMinor} >= 0`),
  ],
);

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),
    providerRefundId: text("provider_refund_id"),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    status: refundStatusEnum("status").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("refunds_payment_provider_refund_unique").on(
      t.paymentId,
      t.providerRefundId,
    ),
    check("refunds_amount_positive", sql`${t.amountMinor} > 0`),
  ],
);

export const bundleDiscountRules = pgTable(
  "bundle_discount_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    editorPlanId: uuid("editor_plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    storagePlanId: uuid("storage_plan_id")
      .notNull()
      .references(() => storagePlans.id, { onDelete: "restrict" }),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    discountBasisPoints: integer("discount_basis_points"),
    currency: char("currency", { length: 3 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    validFrom: timestamp("valid_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    validUntil: timestamp("valid_until", { withTimezone: true }),
  },
  (t) => [
    unique("bundle_discount_version_unique").on(
      t.editorPlanId,
      t.storagePlanId,
      t.currency,
      t.validFrom,
    ),
    check("bundle_discount_minor_nonnegative", sql`${t.discountMinor} >= 0`),
    check(
      "bundle_discount_bps_range",
      sql`${t.discountBasisPoints} IS NULL OR ${t.discountBasisPoints} BETWEEN 0 AND 10000`,
    ),
    check(
      "bundle_discount_one_method",
      sql`${t.discountMinor} = 0 OR ${t.discountBasisPoints} IS NULL`,
    ),
    check(
      "bundle_discount_period_valid",
      sql`${t.validUntil} IS NULL OR ${t.validUntil} > ${t.validFrom}`,
    ),
  ],
);

export const paymentWebhookEvents = pgTable(
  "payment_webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    status: webhookStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    lastError: text("last_error"),
  },
  (t) => [
    unique("payment_webhook_provider_event_unique").on(
      t.provider,
      t.providerEventId,
    ),
    index("payment_webhook_events_pending_idx")
      .on(t.receivedAt)
      .where(sql`${t.status} IN ('pending', 'failed')`),
    check("payment_webhook_attempts_nonnegative", sql`${t.attempts} >= 0`),
  ],
);

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scope: text("scope").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    requestHash: bytea("request_hash").notNull(),
    responseStatus: integer("response_status"),
    responseBody: jsonb("response_body"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    unique("idempotency_scope_key_unique").on(t.scope, t.idempotencyKey),
    index("idempotency_keys_expiry_idx").on(t.expiresAt),
    check(
      "idempotency_response_status_range",
      sql`${t.responseStatus} IS NULL OR ${t.responseStatus} BETWEEN 100 AND 599`,
    ),
  ],
);

/* ------------------------------ Waitlist ------------------------------ */

/**
 * Early-access / waitlist signups. Standalone from `users`: a waitlist entry
 * is not an account. `emailNormalized` mirrors the `users` normalization so
 * duplicate registrations are rejected at the database level.
 */
export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized")
      .generatedAlwaysAs(sql`lower(trim(email))`)
      .notNull(),
    source: text("source").notNull().default("site"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("waitlist_signups_email_unique").on(t.emailNormalized),
    check("waitlist_signups_email_not_blank", sql`length(trim(${t.email})) > 0`),
    check("waitlist_signups_name_not_blank", sql`length(trim(${t.name})) > 0`),
  ],
);

/* ------------------------------ Drizzle relations ------------------------------ */

export const usersRelations = relations(users, ({ many }) => ({
  oauthAccounts: many(oauthAccounts),
  authSessions: many(authSessions),
  subscriptions: many(subscriptions),
  storageSubscriptions: many(storageSubscriptions),
  tokenLots: many(tokenLots),
  usageEvents: many(usageEvents),
  tokenTransactions: many(tokenTransactions),
  storageObjects: many(storageObjects),
  pluginEntitlements: many(pluginEntitlements),
  orders: many(orders),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, { fields: [oauthAccounts.userId], references: [users.id] }),
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, { fields: [authSessions.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
    plan: one(plans, {
      fields: [subscriptions.planId],
      references: [plans.id],
    }),
    periods: many(subscriptionPeriods),
  }),
);

export const subscriptionPeriodsRelations = relations(
  subscriptionPeriods,
  ({ one, many }) => ({
    subscription: one(subscriptions, {
      fields: [subscriptionPeriods.subscriptionId],
      references: [subscriptions.id],
    }),
    tokenLots: many(tokenLots),
  }),
);

export const storageSubscriptionsRelations = relations(
  storageSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [storageSubscriptions.userId],
      references: [users.id],
    }),
    plan: one(storagePlans, {
      fields: [storageSubscriptions.storagePlanId],
      references: [storagePlans.id],
    }),
  }),
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  plan: one(plans, { fields: [orderItems.planId], references: [plans.id] }),
  storagePlan: one(storagePlans, {
    fields: [orderItems.storagePlanId],
    references: [storagePlans.id],
  }),
  plugin: one(plugins, {
    fields: [orderItems.pluginId],
    references: [plugins.id],
  }),
  tokenLots: many(tokenLots),
}));

export const tokenLotsRelations = relations(tokenLots, ({ one, many }) => ({
  user: one(users, { fields: [tokenLots.userId], references: [users.id] }),
  subscriptionPeriod: one(subscriptionPeriods, {
    fields: [tokenLots.subscriptionPeriodId],
    references: [subscriptionPeriods.id],
  }),
  orderItem: one(orderItems, {
    fields: [tokenLots.orderItemId],
    references: [orderItems.id],
  }),
  transactions: many(tokenTransactions),
}));

export const usageEventsRelations = relations(usageEvents, ({ one, many }) => ({
  user: one(users, { fields: [usageEvents.userId], references: [users.id] }),
  tokenTransactions: many(tokenTransactions),
}));

export const tokenTransactionsRelations = relations(
  tokenTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [tokenTransactions.userId],
      references: [users.id],
    }),
    tokenLot: one(tokenLots, {
      fields: [tokenTransactions.tokenLotId],
      references: [tokenLots.id],
    }),
    usageEvent: one(usageEvents, {
      fields: [tokenTransactions.usageEventId],
      references: [usageEvents.id],
    }),
  }),
);

export const storageObjectsRelations = relations(storageObjects, ({ one }) => ({
  user: one(users, { fields: [storageObjects.userId], references: [users.id] }),
}));

export const pluginsRelations = relations(plugins, ({ many }) => ({
  entitlements: many(pluginEntitlements),
  orderItems: many(orderItems),
}));

export const pluginEntitlementsRelations = relations(
  pluginEntitlements,
  ({ one }) => ({
    user: one(users, {
      fields: [pluginEntitlements.userId],
      references: [users.id],
    }),
    plugin: one(plugins, {
      fields: [pluginEntitlements.pluginId],
      references: [plugins.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  refunds: many(refunds),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  orderItems: many(orderItems),
  bundleDiscountRules: many(bundleDiscountRules),
}));

export const storagePlansRelations = relations(storagePlans, ({ many }) => ({
  subscriptions: many(storageSubscriptions),
  orderItems: many(orderItems),
  bundleDiscountRules: many(bundleDiscountRules),
}));

export const bundleDiscountRulesRelations = relations(
  bundleDiscountRules,
  ({ one }) => ({
    editorPlan: one(plans, {
      fields: [bundleDiscountRules.editorPlanId],
      references: [plans.id],
    }),
    storagePlan: one(storagePlans, {
      fields: [bundleDiscountRules.storagePlanId],
      references: [storagePlans.id],
    }),
  }),
);

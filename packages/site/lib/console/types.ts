export type PreviewSource = "sample";

export interface ConsoleAccount {
  name: string;
  email: string;
  initials: string;
  memberSince: string;
  signInMethod: string;
}

export type PlanStatus = "active" | "trialing" | "past_due" | "canceled" | "none";

export interface ConsolePlan {
  id: string;
  name: string;
  audience: string;
  status: PlanStatus;
  priceMonthly: number | null;
  confirmed: boolean;
  renewalDate: string | null;
}

export interface ConsoleUsage {
  balance: number;
  used: number;
  allowance: number;
  periodStart: string;
  periodEnd: string;
  resetDate: string;
}

export type UsageEventStatus = "completed" | "failed" | "pending";

export interface UsageEvent {
  id: string;
  date: string;
  amount: number;
  operation: string;
  status: UsageEventStatus;
}

export type StorageFileStatus = "ready" | "processing" | "failed";

export interface StorageFile {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  uploadedAt: string;
  project: string;
  status: StorageFileStatus;
}

export interface ConsoleStorage {
  planName: string | null;
  usedBytes: number;
  allowanceBytes: number;
  renewalDate: string | null;
  files: StorageFile[];
}

export type PluginAccess = "included" | "purchased" | "locked" | "planned";

export interface PluginEntitlement {
  slug: string;
  access: PluginAccess;
}

export interface ConsoleActivity {
  id: string;
  date: string;
  type: "subscription" | "plugin" | "tokens" | "storage" | "account";
  title: string;
  description: string;
}

export type OrderStatus = "paid" | "pending" | "refunded" | "failed";

export interface ConsoleOrder {
  id: string;
  reference: string;
  date: string;
  item: string;
  amountCents: number;
  currency: string;
  status: OrderStatus;
  invoiceUrl: string | null;
}

export interface ConsoleSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "none";

export interface ConsoleSubscription {
  id: string;
  planName: string;
  kind: "editing" | "storage";
  status: SubscriptionStatus;
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
}

export type AlertTone = "info" | "success" | "warning" | "error";

export interface ConsoleAlert {
  id: string;
  tone: AlertTone;
  title: string;
  description: string;
}

export interface ConsolePreviewMeta {
  source: PreviewSource;
  label: string;
  notice: string;
}

export interface ConsoleData {
  preview: ConsolePreviewMeta;
  account: ConsoleAccount;
  plan: ConsolePlan;
  usage: ConsoleUsage;
  usageEvents: UsageEvent[];
  storage: ConsoleStorage;
  entitlements: PluginEntitlement[];
  activity: ConsoleActivity[];
  orders: ConsoleOrder[];
  sessions: ConsoleSession[];
  subscriptions: ConsoleSubscription[];
  alerts: ConsoleAlert[];
}

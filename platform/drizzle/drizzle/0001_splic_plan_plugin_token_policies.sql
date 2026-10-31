CREATE TYPE "public"."plan_type" AS ENUM('free', 'byom', 'agent');--> statement-breakpoint
ALTER TYPE "public"."token_transaction_type" ADD VALUE 'lock';--> statement-breakpoint
ALTER TYPE "public"."token_transaction_type" ADD VALUE 'unlock';--> statement-breakpoint
ALTER TYPE "public"."token_transaction_type" ADD VALUE 'expire';--> statement-breakpoint
ALTER TYPE "public"."token_transaction_type" ADD VALUE 'carry_forward';--> statement-breakpoint
CREATE TABLE "plugin_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plugin_categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "plugin_categories_slug_not_blank" CHECK (length(trim("plugin_categories"."slug")) > 0),
	CONSTRAINT "plugin_categories_name_not_blank" CHECK (length(trim("plugin_categories"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "subscription_period_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_period_id" uuid NOT NULL,
	"week_index" integer NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"base_tokens" bigint NOT NULL,
	"carry_in_tokens" bigint DEFAULT 0 NOT NULL,
	"released_at" timestamp with time zone,
	"released_early" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_period_grants_period_week_unique" UNIQUE("subscription_period_id","week_index"),
	CONSTRAINT "subscription_period_grants_week_nonnegative" CHECK ("subscription_period_grants"."week_index" >= 0),
	CONSTRAINT "subscription_period_grants_tokens_nonnegative" CHECK ("subscription_period_grants"."base_tokens" >= 0 AND "subscription_period_grants"."carry_in_tokens" >= 0),
	CONSTRAINT "subscription_period_grants_early_requires_release" CHECK ("subscription_period_grants"."released_early" = false OR "subscription_period_grants"."released_at" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "token_lots" DROP CONSTRAINT "token_lots_token_range";--> statement-breakpoint
ALTER TABLE "token_transactions" DROP CONSTRAINT "token_transactions_amount_matches_type";--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "plan_type" "plan_type" DEFAULT 'agent' NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "grants_agent_access" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "uses_byom" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "storage_quota_bytes" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "paid_plugin_limit" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "is_publicly_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "plugin_entitlements" ADD COLUMN "subscription_id" uuid;--> statement-breakpoint
ALTER TABLE "plugins" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "plugins" ADD COLUMN "is_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plugins" ADD COLUMN "price_minor" bigint;--> statement-breakpoint
ALTER TABLE "plugins" ADD COLUMN "currency" char(3);--> statement-breakpoint
ALTER TABLE "plugins" ADD COLUMN "plugin_category_id" uuid;--> statement-breakpoint
ALTER TABLE "token_lots" ADD COLUMN "locked_tokens" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "token_lots" ADD COLUMN "locked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "token_lots" ADD COLUMN "lock_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD COLUMN "reference_key" text;--> statement-breakpoint
ALTER TABLE "subscription_period_grants" ADD CONSTRAINT "subscription_period_grants_subscription_period_id_subscription_periods_id_fk" FOREIGN KEY ("subscription_period_id") REFERENCES "public"."subscription_periods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_period_grants_pending_idx" ON "subscription_period_grants" USING btree ("scheduled_at") WHERE "subscription_period_grants"."released_at" IS NULL;--> statement-breakpoint
ALTER TABLE "plugin_entitlements" ADD CONSTRAINT "plugin_entitlements_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_plugin_category_id_plugin_categories_id_fk" FOREIGN KEY ("plugin_category_id") REFERENCES "public"."plugin_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plugin_entitlements_user_idx" ON "plugin_entitlements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plugin_entitlements_subscription_idx" ON "plugin_entitlements" USING btree ("subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plugin_entitlements_plan_active_unique" ON "plugin_entitlements" USING btree ("user_id","plugin_id") WHERE "plugin_entitlements"."source" = 'plan' AND "plugin_entitlements"."revoked_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "plugin_entitlements_purchase_active_unique" ON "plugin_entitlements" USING btree ("user_id","plugin_id") WHERE "plugin_entitlements"."source" = 'purchase' AND "plugin_entitlements"."revoked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "plugins_category_idx" ON "plugins" USING btree ("plugin_category_id");--> statement-breakpoint
CREATE INDEX "token_lots_lock_deadline_idx" ON "token_lots" USING btree ("lock_expires_at") WHERE "token_lots"."locked_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "token_transactions_reference_idx" ON "token_transactions" USING btree ("reference_key") WHERE "token_transactions"."reference_key" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_storage_quota_nonnegative" CHECK ("plans"."storage_quota_bytes" >= 0);--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_paid_plugin_limit_nonnegative" CHECK ("plans"."paid_plugin_limit" >= 0);--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_type_capability_consistent" CHECK (
    ("plans"."plan_type" = 'free' AND "plans"."grants_agent_access" = false AND "plans"."uses_byom" = false)
    OR ("plans"."plan_type" = 'byom' AND "plans"."grants_agent_access" = true AND "plans"."uses_byom" = true)
    OR ("plans"."plan_type" = 'agent' AND "plans"."grants_agent_access" = true AND "plans"."uses_byom" = false)
  );--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_byom_zero_allowance" CHECK ("plans"."uses_byom" = false OR "plans"."monthly_token_allowance" = 0);--> statement-breakpoint
ALTER TABLE "plugin_entitlements" ADD CONSTRAINT "plugin_entitlements_plan_requires_subscription" CHECK ("plugin_entitlements"."source" <> 'plan' OR "plugin_entitlements"."subscription_id" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "plugin_entitlements" ADD CONSTRAINT "plugin_entitlements_purchase_ownership" CHECK ("plugin_entitlements"."source" <> 'purchase' OR ("plugin_entitlements"."subscription_id" IS NULL AND "plugin_entitlements"."expires_at" IS NULL));--> statement-breakpoint
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_free_price_null" CHECK ("plugins"."is_paid" = true OR ("plugins"."price_minor" IS NULL AND "plugins"."currency" IS NULL));--> statement-breakpoint
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_paid_price_positive" CHECK ("plugins"."is_paid" = false OR ("plugins"."price_minor" > 0 AND "plugins"."currency" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "token_lots" ADD CONSTRAINT "token_lots_lock_consistent" CHECK (
    ("token_lots"."locked_at" IS NULL AND "token_lots"."lock_expires_at" IS NULL AND "token_lots"."locked_tokens" = 0)
    OR ("token_lots"."locked_at" IS NOT NULL AND "token_lots"."lock_expires_at" IS NOT NULL
        AND "token_lots"."lock_expires_at" = "token_lots"."locked_at" + interval '30 days'
        AND "token_lots"."locked_tokens" >= 0)
  );--> statement-breakpoint
ALTER TABLE "token_lots" ADD CONSTRAINT "token_lots_lock_window_not_expired" CHECK ("token_lots"."locked_at" IS NULL OR "token_lots"."expires_at" IS NULL OR "token_lots"."expires_at" >= "token_lots"."lock_expires_at");--> statement-breakpoint
ALTER TABLE "token_lots" ADD CONSTRAINT "token_lots_token_range" CHECK ("token_lots"."original_tokens" >= 0 AND "token_lots"."remaining_tokens" >= 0 AND "token_lots"."locked_tokens" >= 0 AND "token_lots"."remaining_tokens" + "token_lots"."locked_tokens" <= "token_lots"."original_tokens");--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_amount_matches_type" CHECK (
    ("token_transactions"."transaction_type"::text IN ('grant', 'release', 'refund', 'adjustment', 'unlock') AND "token_transactions"."amount" > 0)
    OR ("token_transactions"."transaction_type"::text IN ('consume', 'lock', 'expire') AND "token_transactions"."amount" < 0)
    OR ("token_transactions"."transaction_type"::text = 'carry_forward' AND "token_transactions"."amount" <> 0)
  );
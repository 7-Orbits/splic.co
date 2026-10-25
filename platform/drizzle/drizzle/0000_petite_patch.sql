CREATE TYPE "public"."oauth_provider" AS ENUM('google', 'microsoft');--> statement-breakpoint
CREATE TYPE "public"."order_item_type" AS ENUM('editor_subscription', 'storage_subscription', 'plugin', 'token_topup');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'authorized', 'succeeded', 'failed', 'partially_refunded', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."plugin_entitlement_source" AS ENUM('plan', 'purchase', 'promotion', 'admin_grant');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."storage_object_status" AS ENUM('pending', 'uploaded', 'available', 'deleting', 'deleted', 'failed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('incomplete', 'trialing', 'active', 'past_due', 'cancelled', 'expired', 'paused');--> statement-breakpoint
CREATE TYPE "public"."token_lot_type" AS ENUM('monthly_allowance', 'purchased_topup');--> statement-breakpoint
CREATE TYPE "public"."token_transaction_type" AS ENUM('grant', 'consume', 'release', 'refund', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."usage_status" AS ENUM('reserved', 'committed', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('pending', 'processing', 'processed', 'failed');--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" "bytea" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"user_agent" text,
	"ip_address" "inet"
);
--> statement-breakpoint
CREATE TABLE "bundle_discount_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"editor_plan_id" uuid NOT NULL,
	"storage_plan_id" uuid NOT NULL,
	"discount_minor" bigint DEFAULT 0 NOT NULL,
	"discount_basis_points" integer,
	"currency" char(3) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	CONSTRAINT "bundle_discount_version_unique" UNIQUE("editor_plan_id","storage_plan_id","currency","valid_from"),
	CONSTRAINT "bundle_discount_minor_nonnegative" CHECK ("bundle_discount_rules"."discount_minor" >= 0),
	CONSTRAINT "bundle_discount_bps_range" CHECK ("bundle_discount_rules"."discount_basis_points" IS NULL OR "bundle_discount_rules"."discount_basis_points" BETWEEN 0 AND 10000),
	CONSTRAINT "bundle_discount_one_method" CHECK ("bundle_discount_rules"."discount_minor" = 0 OR "bundle_discount_rules"."discount_basis_points" IS NULL),
	CONSTRAINT "bundle_discount_period_valid" CHECK ("bundle_discount_rules"."valid_until" IS NULL OR "bundle_discount_rules"."valid_until" > "bundle_discount_rules"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"request_hash" "bytea" NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "idempotency_scope_key_unique" UNIQUE("scope","idempotency_key"),
	CONSTRAINT "idempotency_response_status_range" CHECK ("idempotency_keys"."response_status" IS NULL OR "idempotency_keys"."response_status" BETWEEN 100 AND 599)
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "oauth_provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"provider_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_provider_account_unique" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"item_type" "order_item_type" NOT NULL,
	"plan_id" uuid,
	"storage_plan_id" uuid,
	"plugin_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_minor" bigint NOT NULL,
	"discount_minor" bigint DEFAULT 0 NOT NULL,
	"currency" char(3) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_unit_price_nonnegative" CHECK ("order_items"."unit_price_minor" >= 0),
	CONSTRAINT "order_items_discount_nonnegative" CHECK ("order_items"."discount_minor" >= 0),
	CONSTRAINT "order_items_type_target_consistent" CHECK (
    ("order_items"."item_type" = 'editor_subscription' AND "order_items"."plan_id" IS NOT NULL AND "order_items"."storage_plan_id" IS NULL AND "order_items"."plugin_id" IS NULL)
    OR ("order_items"."item_type" = 'storage_subscription' AND "order_items"."storage_plan_id" IS NOT NULL AND "order_items"."plan_id" IS NULL AND "order_items"."plugin_id" IS NULL)
    OR ("order_items"."item_type" = 'plugin' AND "order_items"."plugin_id" IS NOT NULL AND "order_items"."plan_id" IS NULL AND "order_items"."storage_plan_id" IS NULL)
    OR ("order_items"."item_type" = 'token_topup' AND "order_items"."plan_id" IS NULL AND "order_items"."storage_plan_id" IS NULL AND "order_items"."plugin_id" IS NULL)
  )
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_number" text NOT NULL,
	"status" "order_status" NOT NULL,
	"currency" char(3) NOT NULL,
	"subtotal_minor" bigint NOT NULL,
	"discount_minor" bigint DEFAULT 0 NOT NULL,
	"tax_minor" bigint DEFAULT 0 NOT NULL,
	"total_minor" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "orders_subtotal_nonnegative" CHECK ("orders"."subtotal_minor" >= 0),
	CONSTRAINT "orders_discount_nonnegative" CHECK ("orders"."discount_minor" >= 0),
	CONSTRAINT "orders_tax_nonnegative" CHECK ("orders"."tax_minor" >= 0),
	CONSTRAINT "orders_total_nonnegative" CHECK ("orders"."total_minor" >= 0),
	CONSTRAINT "orders_total_matches_components" CHECK ("orders"."total_minor" = "orders"."subtotal_minor" - "orders"."discount_minor" + "orders"."tax_minor"),
	CONSTRAINT "orders_discount_not_above_subtotal" CHECK ("orders"."discount_minor" <= "orders"."subtotal_minor")
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"provider_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "webhook_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"last_error" text,
	CONSTRAINT "payment_webhook_provider_event_unique" UNIQUE("provider","provider_event_id"),
	CONSTRAINT "payment_webhook_attempts_nonnegative" CHECK ("payment_webhook_events"."attempts" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_payment_id" text,
	"status" "payment_status" NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"succeeded_at" timestamp with time zone,
	CONSTRAINT "payments_provider_payment_unique" UNIQUE("provider","provider_payment_id"),
	CONSTRAINT "payments_amount_nonnegative" CHECK ("payments"."amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"monthly_price_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"monthly_token_allowance" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_code_unique" UNIQUE("code"),
	CONSTRAINT "plans_price_nonnegative" CHECK ("plans"."monthly_price_minor" >= 0),
	CONSTRAINT "plans_token_allowance_nonnegative" CHECK ("plans"."monthly_token_allowance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "plugin_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plugin_id" uuid NOT NULL,
	"source" "plugin_entitlement_source" NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plugin_entitlements_period_valid" CHECK ("plugin_entitlements"."expires_at" IS NULL OR "plugin_entitlements"."expires_at" > "plugin_entitlements"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "plugins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plugins_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"provider_refund_id" text,
	"amount_minor" bigint NOT NULL,
	"status" "refund_status" NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refunds_payment_provider_refund_unique" UNIQUE("payment_id","provider_refund_id"),
	CONSTRAINT "refunds_amount_positive" CHECK ("refunds"."amount_minor" > 0)
);
--> statement-breakpoint
CREATE TABLE "storage_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"object_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"checksum_sha256" text,
	"status" "storage_object_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uploaded_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "storage_objects_key_unique" UNIQUE("object_key"),
	CONSTRAINT "storage_objects_size_nonnegative" CHECK ("storage_objects"."size_bytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "storage_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"price_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"quota_bytes" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "storage_plans_code_unique" UNIQUE("code"),
	CONSTRAINT "storage_plans_price_nonnegative" CHECK ("storage_plans"."price_minor" >= 0),
	CONSTRAINT "storage_plans_quota_nonnegative" CHECK ("storage_plans"."quota_bytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "storage_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"storage_plan_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subscription_id" text,
	"status" "subscription_status" NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "storage_subscriptions_provider_id_unique" UNIQUE("provider","provider_subscription_id"),
	CONSTRAINT "storage_subscriptions_period_valid" CHECK ("storage_subscriptions"."current_period_end" > "storage_subscriptions"."current_period_start")
);
--> statement-breakpoint
CREATE TABLE "subscription_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"token_allowance" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_period_start_unique" UNIQUE("subscription_id","period_start"),
	CONSTRAINT "subscription_period_valid" CHECK ("subscription_periods"."period_end" > "subscription_periods"."period_start"),
	CONSTRAINT "subscription_period_allowance_nonnegative" CHECK ("subscription_periods"."token_allowance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subscription_id" text,
	"status" "subscription_status" NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_provider_id_unique" UNIQUE("provider","provider_subscription_id"),
	CONSTRAINT "subscriptions_period_valid" CHECK ("subscriptions"."current_period_end" > "subscriptions"."current_period_start")
);
--> statement-breakpoint
CREATE TABLE "token_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lot_type" "token_lot_type" NOT NULL,
	"subscription_period_id" uuid,
	"order_item_id" uuid,
	"original_tokens" bigint NOT NULL,
	"remaining_tokens" bigint NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "token_lots_subscription_period_unique" UNIQUE("subscription_period_id"),
	CONSTRAINT "token_lots_order_item_unique" UNIQUE("order_item_id"),
	CONSTRAINT "token_lots_token_range" CHECK ("token_lots"."original_tokens" >= 0 AND "token_lots"."remaining_tokens" >= 0 AND "token_lots"."remaining_tokens" <= "token_lots"."original_tokens"),
	CONSTRAINT "token_lots_type_target_consistent" CHECK (
    ("token_lots"."lot_type" = 'monthly_allowance' AND "token_lots"."subscription_period_id" IS NOT NULL AND "token_lots"."order_item_id" IS NULL AND "token_lots"."expires_at" IS NOT NULL)
    OR ("token_lots"."lot_type" = 'purchased_topup' AND "token_lots"."subscription_period_id" IS NULL AND "token_lots"."order_item_id" IS NOT NULL)
  )
);
--> statement-breakpoint
CREATE TABLE "token_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_lot_id" uuid NOT NULL,
	"usage_event_id" uuid,
	"transaction_key" text NOT NULL,
	"transaction_type" "token_transaction_type" NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "token_transactions_key_unique" UNIQUE("transaction_key"),
	CONSTRAINT "token_transactions_amount_nonzero" CHECK ("token_transactions"."amount" <> 0),
	CONSTRAINT "token_transactions_amount_matches_type" CHECK (
    ("token_transactions"."transaction_type" IN ('grant', 'release', 'refund', 'adjustment') AND "token_transactions"."amount" > 0)
    OR ("token_transactions"."transaction_type" = 'consume' AND "token_transactions"."amount" < 0)
  )
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request_key" text NOT NULL,
	"operation" text NOT NULL,
	"status" "usage_status" NOT NULL,
	"tokens_reserved" bigint DEFAULT 0 NOT NULL,
	"tokens_actual" bigint,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "usage_events_user_request_unique" UNIQUE("user_id","request_key"),
	CONSTRAINT "usage_events_reserved_nonnegative" CHECK ("usage_events"."tokens_reserved" >= 0),
	CONSTRAINT "usage_events_actual_nonnegative" CHECK ("usage_events"."tokens_actual" IS NULL OR "usage_events"."tokens_actual" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text GENERATED ALWAYS AS (lower(trim(email))) STORED NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"email_verified_at" timestamp with time zone,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_normalized_unique" UNIQUE("email_normalized"),
	CONSTRAINT "users_email_not_blank" CHECK (length(trim("users"."email")) > 0)
);
--> statement-breakpoint
CREATE TABLE "waitlist_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text GENERATED ALWAYS AS (lower(trim(email))) STORED NOT NULL,
	"source" text DEFAULT 'site' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_signups_email_unique" UNIQUE("email_normalized"),
	CONSTRAINT "waitlist_signups_email_not_blank" CHECK (length(trim("waitlist_signups"."email")) > 0),
	CONSTRAINT "waitlist_signups_name_not_blank" CHECK (length(trim("waitlist_signups"."name")) > 0)
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_discount_rules" ADD CONSTRAINT "bundle_discount_rules_editor_plan_id_plans_id_fk" FOREIGN KEY ("editor_plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_discount_rules" ADD CONSTRAINT "bundle_discount_rules_storage_plan_id_storage_plans_id_fk" FOREIGN KEY ("storage_plan_id") REFERENCES "public"."storage_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_storage_plan_id_storage_plans_id_fk" FOREIGN KEY ("storage_plan_id") REFERENCES "public"."storage_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_plugin_id_plugins_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "public"."plugins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_entitlements" ADD CONSTRAINT "plugin_entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_entitlements" ADD CONSTRAINT "plugin_entitlements_plugin_id_plugins_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "public"."plugins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_objects" ADD CONSTRAINT "storage_objects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_subscriptions" ADD CONSTRAINT "storage_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_subscriptions" ADD CONSTRAINT "storage_subscriptions_storage_plan_id_storage_plans_id_fk" FOREIGN KEY ("storage_plan_id") REFERENCES "public"."storage_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_periods" ADD CONSTRAINT "subscription_periods_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_lots" ADD CONSTRAINT "token_lots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_lots" ADD CONSTRAINT "token_lots_subscription_period_id_subscription_periods_id_fk" FOREIGN KEY ("subscription_period_id") REFERENCES "public"."subscription_periods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_lots" ADD CONSTRAINT "token_lots_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_token_lot_id_token_lots_id_fk" FOREIGN KEY ("token_lot_id") REFERENCES "public"."token_lots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_usage_event_id_usage_events_id_fk" FOREIGN KEY ("usage_event_id") REFERENCES "public"."usage_events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_refresh_hash_unique" ON "auth_sessions" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_active_idx" ON "auth_sessions" USING btree ("user_id","expires_at") WHERE "auth_sessions"."revoked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idempotency_keys_expiry_idx" ON "idempotency_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "oauth_accounts_user_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_created_idx" ON "orders" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "payment_webhook_events_pending_idx" ON "payment_webhook_events" USING btree ("received_at") WHERE "payment_webhook_events"."status" IN ('pending', 'failed');--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "plugin_entitlements_user_plugin_active_idx" ON "plugin_entitlements" USING btree ("user_id","plugin_id") WHERE "plugin_entitlements"."revoked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "storage_objects_user_status_idx" ON "storage_objects" USING btree ("user_id","status") WHERE "storage_objects"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "storage_subscriptions_user_status_idx" ON "storage_subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_user_status_idx" ON "subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "token_lots_spendable_idx" ON "token_lots" USING btree ("user_id","expires_at","created_at") WHERE "token_lots"."remaining_tokens" > 0;--> statement-breakpoint
CREATE INDEX "token_transactions_user_created_idx" ON "token_transactions" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "token_transactions_lot_created_idx" ON "token_transactions" USING btree ("token_lot_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_events_user_created_idx" ON "usage_events" USING btree ("user_id","created_at" DESC NULLS LAST);
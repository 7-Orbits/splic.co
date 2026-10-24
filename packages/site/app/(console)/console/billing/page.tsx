import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { EmptyState } from "@/components/console/empty-state";
import { BillingManagement } from "@/components/console/billing-management";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  editingPlans,
  pricingNotice,
  storageTiers,
} from "@/content/pricing";
import { formatDate } from "@/lib/console/format";
import { previewConsoleData } from "@/lib/console/preview-data";
import type { SubscriptionStatus } from "@/lib/console/types";

export const metadata: Metadata = {
  title: "Billing & Plans",
};

const statusTone: Record<SubscriptionStatus, BadgeTone> = {
  active: "ok",
  canceled: "neutral",
  past_due: "warn",
  none: "neutral",
};

const statusLabel: Record<SubscriptionStatus, string> = {
  active: "Active",
  canceled: "Canceled",
  past_due: "Payment due",
  none: "None",
};

export default function ConsoleBillingPage() {
  const data = previewConsoleData;
  const editingSubscription = data.subscriptions.find(
    (subscription) => subscription.kind === "editing",
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Billing & Plans"
        description="Splic plans, optional cloud storage and subscription state."
        sample
        actions={
          <Button href="/pricing" variant="secondary" size="sm">
            Compare all plans
          </Button>
        }
      />

      <ContextualAlert
        tone="info"
        title="Billing is not connected in this preview"
        description={`${pricingNotice} Plans and prices shown here are product configuration, not a live checkout. Subscription state is sample data and is not confirmed by a payment provider.`}
        sample
      />

      <section aria-labelledby="current-subscriptions-heading">
        <h2
          id="current-subscriptions-heading"
          className="mb-3 text-md font-medium text-text-primary"
        >
          Current subscriptions
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {data.subscriptions.map((subscription) => (
            <Panel key={subscription.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                    {subscription.kind === "editing"
                      ? "Splic plan"
                      : "Cloud storage"}
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.01em] text-text-primary">
                    {subscription.planName}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {subscription.renewalDate
                      ? `Renews ${formatDate(subscription.renewalDate)}`
                      : "No renewal scheduled"}
                    {subscription.cancelAtPeriodEnd
                      ? " · Cancels at period end"
                      : ""}
                  </p>
                </div>
                <StatusBadge tone={statusTone[subscription.status]}>
                  {statusLabel[subscription.status]}
                </StatusBadge>
              </div>

              <div className="mt-5 border-t border-border-subtle pt-4">
                {subscription.kind === "editing" ? (
                  <BillingManagement planName={subscription.planName} />
                ) : (
                  <Button
                    href="/console/storage"
                    variant="secondary"
                    size="sm"
                  >
                    View storage
                  </Button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section aria-labelledby="available-plans-heading">
        <div className="mb-3">
          <h2
            id="available-plans-heading"
            className="text-md font-medium text-text-primary"
          >
            Splic plans
          </h2>
          <p className="mt-0.5 text-sm text-text-tertiary">
            Every plan includes the full manual editor. Paid plans add agent
            usage and plugin access.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {editingPlans.map((plan) => {
            const current = plan.name === data.plan.name;
            return (
              <Panel key={plan.id} className="flex flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-md font-semibold text-text-primary">
                    {plan.name}
                  </h3>
                  {current ? (
                    <StatusBadge tone="accent">Current sample</StatusBadge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-text-tertiary">
                  {plan.audience}
                </p>
                <p className="mt-4 text-lg font-semibold text-text-primary">
                  {plan.confirmed && plan.priceMonthly !== null
                    ? plan.priceMonthly === 0
                      ? "$0"
                      : `$${plan.priceMonthly} / month`
                    : "Announced at launch"}
                </p>
                <ul className="mt-4 flex flex-1 flex-col gap-2 border-t border-border-subtle pt-4">
                  {plan.entitlements.map((entitlement) => (
                    <li key={entitlement.label} className="text-sm">
                      <span className="block text-text-tertiary">
                        {entitlement.label}
                      </span>
                      <span className="mt-0.5 block text-text-secondary">
                        {entitlement.confirmed
                          ? entitlement.value
                          : "Announced at launch"}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  {current ? (
                    <Button variant="secondary" size="sm" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button href="/pricing" variant="secondary" size="sm">
                      View plan
                    </Button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="storage-plans-heading">
        <div className="mb-3">
          <h2
            id="storage-plans-heading"
            className="text-md font-medium text-text-primary"
          >
            Cloud storage add-ons
          </h2>
          <p className="mt-0.5 text-sm text-text-tertiary">
            Optional capacity. Local editing never requires cloud storage.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {storageTiers.map((tier) => (
            <Panel key={tier.id} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-md font-semibold text-text-primary">
                  {tier.planName}
                </h3>
                <StatusBadge>Add-on</StatusBadge>
              </div>
              <p className="mt-3 text-lg font-semibold text-text-primary">
                {tier.confirmed && tier.priceMonthly !== null
                  ? `$${tier.priceMonthly} / month`
                  : "Announced at launch"}
              </p>
              <p className="mt-1 text-sm text-text-tertiary">
                Storage amount: {tier.quota ?? "announced at launch"}
              </p>
              <div className="mt-4">
                <Button href="/pricing" variant="secondary" size="sm">
                  View storage plans
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <Panel className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-md font-medium text-text-primary">
              Payment method
            </h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              Payment details are managed by the billing provider.
            </p>
          </div>
          <StatusBadge tone="neutral">Not connected</StatusBadge>
        </div>
        <div className="mt-4">
          <EmptyState
            compact
            icon={CreditCard}
            title="No payment method in preview."
            description={
              editingSubscription
                ? "This sample subscription has no real payment method. A live Console must confirm billing state from the server."
                : "A live Console must load payment methods from the billing provider."
            }
          />
        </div>
      </Panel>
    </div>
  );
}

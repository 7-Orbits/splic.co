import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Blocks,
  Cloud,
  CreditCard,
  Gauge,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { PlanSummary } from "@/components/console/plan-summary";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { UsageMeter } from "@/components/console/usage-meter";
import { StorageMeter } from "@/components/console/storage-meter";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { plugins, pluginStatusLabels } from "@/content/plugins";
import {
  formatCompact,
  formatDate,
  formatTokens,
} from "@/lib/console/format";
import { previewConsoleData } from "@/lib/console/preview-data";
import type { ConsoleActivity } from "@/lib/console/types";

export const metadata: Metadata = {
  title: "Overview",
};

const activityIcons: Record<ConsoleActivity["type"], LucideIcon> = {
  subscription: CreditCard,
  plugin: Blocks,
  tokens: Gauge,
  storage: Cloud,
  account: UserRound,
};

export default function ConsoleOverviewPage() {
  const data = previewConsoleData;
  const recentActivity = data.activity.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="Your plan, allowance and account activity at a glance."
        sample
        actions={
          <Button href="/pricing" variant="secondary" size="sm">
            Compare plans
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PlanSummary plan={data.plan} sample />
        </div>

        <Panel className="flex flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-md font-medium text-text-primary">
              Needs attention
            </h2>
            <StatusBadge tone="warn">{data.alerts.length} sample</StatusBadge>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {data.alerts.map((alert) => (
              <ContextualAlert
                key={alert.id}
                tone={alert.tone}
                title={alert.title}
                description={alert.description}
                sample
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Token usage
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-text-primary">
                {formatCompact(data.usage.balance)}
              </p>
              <p className="text-sm text-text-secondary">tokens available</p>
            </div>
            <StatusBadge tone="neutral">Sample</StatusBadge>
          </div>

          <UsageMeter
            label="Current period"
            value={data.usage.used}
            max={data.usage.allowance}
            valueLabel={`${formatTokens(data.usage.used)} used`}
            caption={`Resets ${formatDate(data.usage.resetDate)}`}
            className="mt-5"
          />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <Link
              href="/console/usage"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              View usage details
            </Link>
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Token purchases are not connected in this preview"
            >
              Buy extra tokens
            </Button>
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Cloud storage
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                {data.storage.planName ?? "Not subscribed"}
              </p>
              <p className="text-sm text-text-secondary">
                {data.storage.planName
                  ? "Sample storage add-on"
                  : "Local editing doesn't need cloud storage"}
              </p>
            </div>
            <StatusBadge tone="neutral">Sample</StatusBadge>
          </div>

          <StorageMeter
            usedBytes={data.storage.usedBytes}
            allowanceBytes={data.storage.allowanceBytes}
            className="mt-5"
          />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <Link
              href="/console/storage"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Manage storage
            </Link>
            <Button href="/pricing" variant="secondary" size="sm">
              Storage plans
            </Button>
          </div>
        </Panel>

        <Panel className="flex flex-col p-5 md:col-span-2 xl:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Plugin access
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-text-primary">
                {data.entitlements.length}
              </p>
              <p className="text-sm text-text-secondary">
                paid plugin entitlements
              </p>
            </div>
            <StatusBadge tone="neutral">Sample</StatusBadge>
          </div>

          <ul className="mt-5 flex flex-1 flex-col gap-2 border-t border-border-subtle pt-4">
            {plugins.map((plugin) => (
              <li
                key={plugin.slug}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate text-md text-text-secondary">
                  {plugin.name}
                </span>
                <StatusBadge tone="warn">
                  {pluginStatusLabels[plugin.status]}
                </StatusBadge>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              href="/console/plugins"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Browse plugins
            </Link>
            <Sparkles
              aria-hidden="true"
              className="h-4 w-4 text-text-tertiary"
            />
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="text-md font-medium text-text-primary">
              Recent activity
            </h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              Sample events from the preview account.
            </p>
          </div>
          <StatusBadge tone="neutral">Sample</StatusBadge>
        </div>

        <ol className="divide-y divide-border-subtle">
          {recentActivity.map((event) => {
            const Icon = activityIcons[event.type];
            return (
              <li
                key={event.id}
                className="flex items-start gap-3 px-5 py-4 first:pt-4"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-raised text-text-secondary">
                  <Icon
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-md text-text-primary">{event.title}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {event.description}
                  </p>
                </div>
                <time
                  dateTime={event.date}
                  className="shrink-0 text-sm tabular-nums text-text-tertiary"
                >
                  {formatDate(event.date)}
                </time>
              </li>
            );
          })}
        </ol>
      </Panel>
    </div>
  );
}

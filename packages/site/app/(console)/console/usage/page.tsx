import type { Metadata } from "next";
import { Gauge } from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { UsageMeter } from "@/components/console/usage-meter";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { DataTable, type DataTableRow } from "@/components/console/data-table";
import { EmptyState } from "@/components/console/empty-state";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  formatCompact,
  formatDate,
  formatNumber,
  formatTokens,
} from "@/lib/console/format";
import { previewConsoleData } from "@/lib/console/preview-data";
import type { UsageEventStatus } from "@/lib/console/types";

export const metadata: Metadata = {
  title: "Usage & Limits",
};

const statusTone: Record<UsageEventStatus, BadgeTone> = {
  completed: "ok",
  failed: "error",
  pending: "warn",
};

const statusLabel: Record<UsageEventStatus, string> = {
  completed: "Completed",
  failed: "Failed",
  pending: "Pending",
};

export default function ConsoleUsagePage() {
  const data = previewConsoleData;
  const usage = data.usage;

  const rows: DataTableRow[] = data.usageEvents.map((event) => ({
    key: event.id,
    cells: [
      <time key="date" dateTime={event.date} className="tabular-nums">
        {formatDate(event.date)}
      </time>,
      <span key="operation" className="text-text-primary">
        {event.operation}
      </span>,
      <span key="amount" className="tabular-nums">
        {formatNumber(event.amount)}
      </span>,
      <StatusBadge key="status" tone={statusTone[event.status]}>
        {statusLabel[event.status]}
      </StatusBadge>,
    ],
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usage & Limits"
        description="Token balance, current-period usage and sample usage history."
        sample
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Available
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-text-primary">
            {formatCompact(usage.balance)}
          </p>
          <p className="text-sm text-text-secondary">tokens</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Used this period
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-text-primary">
            {formatCompact(usage.used)}
          </p>
          <p className="text-sm text-text-secondary">
            of {formatCompact(usage.allowance)} sample allowance
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Resets
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
            {formatDate(usage.resetDate)}
          </p>
          <p className="text-sm text-text-secondary">
            Period ends {formatDate(usage.periodEnd)}
          </p>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <UsageMeter
            label="Current period usage"
            value={usage.used}
            max={usage.allowance}
            valueLabel={`${formatTokens(usage.used)} used`}
            caption={`${formatTokens(usage.balance)} available`}
            className="w-full max-w-[560px]"
          />
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Token purchases are not connected in this preview"
            >
              Buy extra tokens
            </Button>
            <p className="text-xs text-text-tertiary">
              Token purchases aren&apos;t connected in this preview.
            </p>
          </div>
        </div>
      </Panel>

      <ContextualAlert
        tone="warning"
        title="Allowances and exhaustion rules are not finalised"
        description="The numbers here are sample data. Real reset schedules, overage behaviour and purchase options must come from confirmed plan and billing data — this preview does not imply unlimited usage."
        sample
      />

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="text-md font-medium text-text-primary">
              Usage history
            </h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              Recent sample operations, newest first.
            </p>
          </div>
          <StatusBadge tone="neutral">Sample</StatusBadge>
        </div>
        <DataTable
          caption="Sample token usage history"
          columns={[
            { header: "Date" },
            { header: "Operation" },
            { header: "Tokens" },
            { header: "Status" },
          ]}
          rows={rows}
          pageSize={6}
          empty={
            <div className="p-5">
              <EmptyState
                compact
                icon={Gauge}
                title="No usage events yet."
                description="Usage events will appear here once account data is connected."
              />
            </div>
          }
        />
      </Panel>
    </div>
  );
}

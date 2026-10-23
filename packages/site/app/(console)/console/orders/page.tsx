import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { DataTable, type DataTableRow } from "@/components/console/data-table";
import { EmptyState } from "@/components/console/empty-state";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/console/format";
import { previewConsoleData } from "@/lib/console/preview-data";
import type { OrderStatus } from "@/lib/console/types";

export const metadata: Metadata = {
  title: "Orders & Purchases",
};

const statusTone: Record<OrderStatus, BadgeTone> = {
  paid: "ok",
  pending: "warn",
  refunded: "neutral",
  failed: "error",
};

const statusLabel: Record<OrderStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
  failed: "Failed",
};

export default function ConsoleOrdersPage() {
  const data = previewConsoleData;

  const rows: DataTableRow[] = data.orders.map((order) => ({
    key: order.id,
    cells: [
      <span key="reference" className="font-mono text-sm text-text-primary">
        {order.reference}
      </span>,
      <time key="date" dateTime={order.date} className="tabular-nums">
        {formatDate(order.date)}
      </time>,
      <span key="item" className="block max-w-[260px]">
        {order.item}
      </span>,
      <span key="amount" className="tabular-nums text-text-primary">
        {formatCurrency(order.amountCents, order.currency)}
      </span>,
      <StatusBadge key="status" tone={statusTone[order.status]}>
        {statusLabel[order.status]}
      </StatusBadge>,
      <Button
        key="invoice"
        variant="ghost"
        size="sm"
        disabled
        title="Invoices are not connected in this preview"
      >
        Invoice
      </Button>,
    ],
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders & Purchases"
        description="Subscription payments, storage add-ons and token purchases."
        sample
        actions={
          <Button href="/console/billing" variant="secondary" size="sm">
            Billing & plans
          </Button>
        }
      />

      <ContextualAlert
        tone="info"
        title="Sample purchase history"
        description="These orders are fixtures. Invoice downloads require a billing provider and are not connected in this preview."
        sample
      />

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="text-md font-medium text-text-primary">
              Purchase history
            </h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              {data.orders.length} sample transactions.
            </p>
          </div>
          <StatusBadge tone="neutral">Sample</StatusBadge>
        </div>
        <DataTable
          caption="Sample order and purchase history"
          columns={[
            { header: "Reference" },
            { header: "Date" },
            { header: "Item" },
            { header: "Amount" },
            { header: "Status" },
            { header: "Invoice" },
          ]}
          rows={rows}
          pageSize={5}
          empty={
            <div className="p-5">
              <EmptyState
                compact
                icon={ReceiptText}
                title="No purchases yet."
                description="Orders will appear here once billing is connected."
              />
            </div>
          }
        />
      </Panel>
    </div>
  );
}

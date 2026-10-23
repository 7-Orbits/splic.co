import type { Metadata } from "next";
import { Cloud, HardDrive, Laptop } from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { StorageMeter } from "@/components/console/storage-meter";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { DataTable, type DataTableRow } from "@/components/console/data-table";
import { EmptyState } from "@/components/console/empty-state";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/console/format";
import { previewConsoleData } from "@/lib/console/preview-data";
import type { StorageFileStatus } from "@/lib/console/types";

export const metadata: Metadata = {
  title: "Cloud Storage",
};

const statusTone: Record<StorageFileStatus, BadgeTone> = {
  ready: "ok",
  processing: "warn",
  failed: "error",
};

const statusLabel: Record<StorageFileStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  failed: "Failed",
};

export default function ConsoleStoragePage() {
  const data = previewConsoleData;
  const storage = data.storage;
  const remaining = Math.max(0, storage.allowanceBytes - storage.usedBytes);

  const rows: DataTableRow[] = storage.files.map((file) => ({
    key: file.id,
    cells: [
      <span key="name" className="block max-w-[240px] truncate text-text-primary">
        {file.name}
      </span>,
      file.type,
      <span key="size" className="tabular-nums">
        {formatBytes(file.sizeBytes)}
      </span>,
      <time key="uploaded" dateTime={file.uploadedAt} className="tabular-nums">
        {formatDate(file.uploadedAt)}
      </time>,
      file.project,
      <StatusBadge key="status" tone={statusTone[file.status]}>
        {statusLabel[file.status]}
      </StatusBadge>,
    ],
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cloud Storage"
        description="Optional cloud capacity for projects, footage and exports. Local editing never requires it."
        sample
        actions={
          <Button href="/pricing" variant="secondary" size="sm">
            Storage plans
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Current plan
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                {storage.planName ?? "Not subscribed"}
              </p>
              <p className="text-sm text-text-secondary">
                {storage.renewalDate
                  ? `Sample renewal ${formatDate(storage.renewalDate)}`
                  : "No renewal date in this preview"}
              </p>
            </div>
            <StatusBadge tone="neutral">Sample</StatusBadge>
          </div>

          <StorageMeter
            usedBytes={storage.usedBytes}
            allowanceBytes={storage.allowanceBytes}
            className="mt-6"
          />
        </Panel>

        <Panel className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
              Used
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-text-primary">
              {formatBytes(storage.usedBytes)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
              Remaining
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-text-primary">
              {formatBytes(remaining)}
            </p>
          </div>
          <div className="col-span-2 border-t border-border-subtle pt-4">
            <p className="text-sm text-text-secondary">
              Files stored here are cloud copies. Project files on your computer
              are not counted against this allowance.
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-surface-primary p-5">
          <div className="flex items-center gap-2.5">
            <Laptop
              aria-hidden="true"
              className="h-4 w-4 text-text-secondary"
              strokeWidth={1.8}
            />
            <h2 className="text-md font-medium text-text-primary">
              On your computer
            </h2>
          </div>
          <p className="mt-2 text-sm leading-5 text-text-secondary">
            Local projects, media and exports live on your machine. You can keep
            editing locally without a storage plan.
          </p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-primary p-5">
          <div className="flex items-center gap-2.5">
            <Cloud
              aria-hidden="true"
              className="h-4 w-4 text-accent-secondary"
              strokeWidth={1.8}
            />
            <h2 className="text-md font-medium text-text-primary">
              In cloud storage
            </h2>
          </div>
          <p className="mt-2 text-sm leading-5 text-text-secondary">
            Cloud storage adds capacity and supports cloud-based features when
            your plan includes them. It is optional.
          </p>
        </div>
      </div>

      <ContextualAlert
        tone="warning"
        title="Uploads, downloads and expiry policy are not connected"
        description="Presigned upload and download URLs require the storage backend. This preview does not promise a deletion policy, grace period or read-only mode."
        sample
      />

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="text-md font-medium text-text-primary">Files</h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              Sample metadata for preview only.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="neutral">
              {storage.files.length} sample files
            </StatusBadge>
            <HardDrive
              aria-hidden="true"
              className="h-4 w-4 text-text-tertiary"
            />
          </div>
        </div>
        <DataTable
          caption="Sample cloud storage files"
          columns={[
            { header: "File" },
            { header: "Type" },
            { header: "Size" },
            { header: "Uploaded" },
            { header: "Project" },
            { header: "Status" },
          ]}
          rows={rows}
          pageSize={6}
          empty={
            <div className="p-5">
              <EmptyState
                compact
                icon={Cloud}
                title="No cloud files yet."
                description="Cloud files will appear here once storage is connected."
              />
            </div>
          }
        />
        <p className="border-t border-border-subtle px-5 py-3 text-xs text-text-tertiary">
          Download actions are unavailable until the storage backend provides
          short-lived authorised URLs.
        </p>
      </Panel>
    </div>
  );
}

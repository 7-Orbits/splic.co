import type { Metadata } from "next";
import { Blocks, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { PluginDirectory } from "@/components/console/plugin-directory";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { EmptyState } from "@/components/console/empty-state";
import { Button } from "@/components/ui/button";
import { plugins } from "@/content/plugins";
import { previewConsoleData } from "@/lib/console/preview-data";

export const metadata: Metadata = {
  title: "Plugins",
};

export default function ConsolePluginsPage() {
  const data = previewConsoleData;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plugins"
        description="Plugin entitlements linked to your account. Installation happens inside the Splic desktop app."
        sample
        actions={
          <Button href="/plugins" variant="secondary" size="sm">
            Marketing catalogue
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <ContextualAlert
        tone="info"
        title="Entitlements, not installation"
        description="This Console shows what your account can access. Plugins are installed and updated in the desktop app once it is available."
      />

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="text-md font-medium text-text-primary">
              Your plugin access
            </h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              Paid plugin entitlements from your plan or purchases.
            </p>
          </div>
        </div>
        <div className="p-5">
          {data.entitlements.length === 0 ? (
            <EmptyState
              compact
              icon={Blocks}
              title="No paid plugin entitlements yet."
              description="No plugin in the catalogue has shipped, and this preview account has no sample entitlements. Paid plugin access is granted by a plan or a purchase."
              action={
                <Button href="/pricing" variant="secondary" size="sm">
                  Compare plans
                </Button>
              }
            />
          ) : null}
        </div>
      </Panel>

      <section aria-labelledby="plugin-catalogue-heading">
        <div className="mb-4">
          <h2
            id="plugin-catalogue-heading"
            className="text-md font-medium text-text-primary"
          >
            Catalogue
          </h2>
          <p className="mt-0.5 text-sm text-text-tertiary">
            Every current workflow is planned. No install or purchase action is
            connected in this preview.
          </p>
        </div>
        <PluginDirectory
          plugins={plugins}
          entitlements={data.entitlements}
        />
      </section>
    </div>
  );
}

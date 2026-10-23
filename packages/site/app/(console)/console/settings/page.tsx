import type { Metadata } from "next";
import { LogOut, SlidersHorizontal, Trash2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { EmptyState } from "@/components/console/empty-state";
import { SettingsForm } from "@/components/console/settings-form";
import { Button } from "@/components/ui/button";
import { previewConsoleData } from "@/lib/console/preview-data";

export const metadata: Metadata = {
  title: "Settings",
};

export default function ConsoleSettingsPage() {
  const data = previewConsoleData;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Profile information and account management."
        sample
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <UserRound
              aria-hidden="true"
              className="h-4 w-4 text-text-secondary"
              strokeWidth={1.8}
            />
            <h2 className="text-md font-medium text-text-primary">Profile</h2>
          </div>
          <p className="mt-1.5 text-sm text-text-tertiary">
            Basic account information supported by the sign-in provider.
          </p>
          <div className="mt-5">
            <SettingsForm account={data.account} />
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <h2 className="text-md font-medium text-text-primary">
            Account management
          </h2>
          <p className="mt-1.5 text-sm text-text-tertiary">
            Account deletion requires a confirmed server-side deletion flow. It
            is not available in this preview.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button href="/" variant="secondary" size="sm">
              <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
              Exit preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Account deletion is not connected in this preview"
            >
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
              Delete account
            </Button>
          </div>
          <div className="mt-auto pt-5">
            <ContextualAlert
              tone="warning"
              title="Destructive actions need confirmation"
              description="No account deletion is performed here. A live Console must confirm the action on the server before showing success."
            />
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal
            aria-hidden="true"
            className="h-4 w-4 text-text-secondary"
            strokeWidth={1.8}
          />
          <h2 className="text-md font-medium text-text-primary">
            Preferences
          </h2>
        </div>
        <p className="mt-1.5 text-sm text-text-tertiary">
          Only preferences the product actually supports are shown.
        </p>
        <div className="mt-4">
          <EmptyState
            compact
            title="No account preferences yet."
            description="Theme, notification and workspace preferences are not implemented. This preview does not add nonfunctional toggles."
          />
        </div>
      </Panel>
    </div>
  );
}

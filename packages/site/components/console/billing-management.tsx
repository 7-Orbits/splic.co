"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "./confirmation-dialog";

interface BillingManagementProps {
  planName: string;
}

export function BillingManagement({ planName }: BillingManagementProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled
        title="The billing portal is not connected in this preview"
      >
        Manage in billing portal
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmOpen(true)}
      >
        Cancel subscription
      </Button>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Cancel the sample ${planName} subscription?`}
        description="Cancellation is not connected in this preview. No real subscription will be changed, and no cancellation state will be recorded."
        confirmLabel="Not available in preview"
        confirmDisabled
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}

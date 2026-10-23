"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/console/empty-state";

export default function ConsoleError({ reset }: { reset: () => void }) {
  return (
    <div role="alert">
      <EmptyState
        title="This page couldn't load."
        description="Something went wrong while rendering the Console preview. Try again."
        action={
          <Button variant="secondary" size="sm" onClick={reset}>
            Try again
          </Button>
        }
      />
    </div>
  );
}

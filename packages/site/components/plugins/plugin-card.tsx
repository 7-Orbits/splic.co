import Link from "next/link";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import {
  pluginStatusLabels,
  type Plugin,
  type PluginStatus,
} from "@/content/plugins";

const toneByStatus: Record<PluginStatus, BadgeTone> = {
  free: "ok",
  included: "accent",
  premium: "info",
  planned: "warn",
  unavailable: "error",
};

interface PluginCardProps {
  plugin: Plugin;
}

/**
 * Single link target: the whole card is clickable via a stretched anchor.
 * No nested interactive elements. Unavailable plugins are non-interactive.
 */
export function PluginCard({ plugin }: PluginCardProps) {
  const unavailable = plugin.status === "unavailable";

  const body = (
    <>
      <div className="flex items-center gap-3">
        <StatusBadge tone={toneByStatus[plugin.status]}>
          {pluginStatusLabels[plugin.status]}
        </StatusBadge>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-text-primary">
        {plugin.name}
      </h3>
      <p className="mt-1.5 text-md text-text-tertiary">{plugin.audience}</p>
      <p className="mt-3 text-md text-text-secondary">{plugin.problem}</p>
      {!unavailable ? (
        <span className="mt-5 inline-flex items-center gap-1.5 text-md font-medium text-accent-primary">
          View details
          <span aria-hidden="true">→</span>
        </span>
      ) : null}
    </>
  );

  if (unavailable) {
    return (
      <div className="glass rounded-lg p-6 opacity-60">
        {body}
        <p className="mt-4 text-md text-accent-error">
          Currently unavailable
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/plugins/${plugin.slug}`}
      data-spotlight=""
      className="group glass glass-interactive block rounded-lg p-6"
    >
      {body}
    </Link>
  );
}

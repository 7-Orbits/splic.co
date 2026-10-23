"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/console/empty-state";
import {
  pluginStatusLabels,
  type Plugin,
  type PluginStatus,
} from "@/content/plugins";
import type { PluginEntitlement } from "@/lib/console/types";

type AccessState = PluginStatus | "purchased";

const toneByAccess: Record<AccessState, BadgeTone> = {
  free: "ok",
  included: "accent",
  purchased: "accent",
  premium: "info",
  planned: "warn",
  unavailable: "error",
};

const accessLabels: Record<AccessState, string> = {
  ...pluginStatusLabels,
  purchased: "Purchased",
};

type FilterId = "all" | "planned" | "included" | "purchased" | "locked";

const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "planned", label: "Planned" },
  { id: "included", label: "Included" },
  { id: "purchased", label: "Purchased" },
  { id: "locked", label: "Locked" },
];

function accessFor(
  plugin: Plugin,
  entitlements: PluginEntitlement[],
): AccessState {
  const entitlement = entitlements.find((item) => item.slug === plugin.slug);
  if (!entitlement) return plugin.status;
  if (entitlement.access === "locked") return "unavailable";
  return entitlement.access;
}

interface PluginDirectoryProps {
  plugins: Plugin[];
  entitlements: PluginEntitlement[];
}

export function PluginDirectory({
  plugins,
  entitlements,
}: PluginDirectoryProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const entries = useMemo(
    () =>
      plugins.map((plugin) => ({
        plugin,
        access: accessFor(plugin, entitlements),
      })),
    [plugins, entitlements],
  );

  const visible = entries.filter(({ plugin, access }) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "locked"
        ? access === "unavailable" || access === "premium"
        : access === filter);
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      needle.length === 0 ||
      `${plugin.name} ${plugin.audience} ${plugin.summary}`
        .toLowerCase()
        .includes(needle);
    return matchesFilter && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-[320px]">
          <span className="sr-only">Search plugins</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search plugins"
            className="glass-field w-full rounded-md py-2 pl-9 pr-3 text-md text-text-primary"
          />
        </label>

        <div className="flex flex-wrap gap-1.5" aria-label="Filter plugins">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                filter === item.id
                  ? "border-accent-primary bg-accent-primary text-text-inverse"
                  : "border-border-interactive text-text-secondary hover:bg-surface-interactive hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            compact
            title="No plugins match."
            description="Try a different search term or filter."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {visible.map(({ plugin, access }) => (
            <article
              key={plugin.slug}
              className="rounded-lg border border-border-subtle bg-surface-primary p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-md font-semibold text-text-primary">
                    {plugin.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-tertiary">
                    {plugin.audience}
                  </p>
                </div>
                <StatusBadge tone={toneByAccess[access]}>
                  {accessLabels[access]}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-5 text-text-secondary">
                {plugin.summary}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-subtle pt-3.5">
                <p className="text-xs text-text-tertiary">
                  {access === "planned"
                    ? "Not released yet"
                    : access === "included" || access === "purchased"
                      ? "Install from the desktop app"
                      : access === "free"
                        ? "Free with Splic"
                        : "Access details at launch"}
                </p>
                {access === "premium" ? (
                  <Button href="/pricing" variant="secondary" size="sm">
                    View plans
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" disabled>
                    {access === "planned" ? "Planned" : "Desktop app only"}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

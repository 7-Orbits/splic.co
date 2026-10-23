"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PlatformId, PlatformRelease } from "@/content/release";

interface PlatformSelectorProps {
  platforms: PlatformRelease[];
}

const osGlyphs: Record<PlatformId, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
};

function detectPlatform(): PlatformId | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  if (/mac|iphone|ipad/.test(ua)) return "macos";
  if (/win/.test(ua)) return "windows";
  if (/linux|android/.test(ua)) return "linux";
  return null;
}

/**
 * Operating-system picker and per-platform installer panel.
 *
 * In `available` state the primary control is a real anchor with `download`.
 * Coming-soon tiles stay focusable and describe their status via
 * aria-describedby. The visitor's OS is a suggestion only — selection is
 * always manual and arrow-key operable.
 */
export function PlatformSelector({ platforms }: PlatformSelectorProps) {
  const detected = useMemo(() => detectPlatform(), []);
  const [selectedId, setSelectedId] = useState<PlatformId | null>(
    detected ?? platforms[0]?.id ?? null,
  );

  const tileRefs = useRef<Array<HTMLLabelElement | null>>([]);

  const selectedIndex = platforms.findIndex((p) => p.id === selectedId);
  const selected = selectedId
    ? (platforms.find((p) => p.id === selectedId) ?? null)
    : null;

  useEffect(() => {
    // Keep roving focus target in sync when selection changes via click.
  }, [selectedId]);

  const move = (delta: number) => {
    if (platforms.length === 0) return;
    const current = selectedIndex < 0 ? 0 : selectedIndex;
    const next = (current + delta + platforms.length) % platforms.length;
    setSelectedId(platforms[next].id);
    tileRefs.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        event.preventDefault();
        setSelectedId(platforms[0].id);
        tileRefs.current[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        setSelectedId(platforms[platforms.length - 1].id);
        tileRefs.current[platforms.length - 1]?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Operating system"
        data-reveal-group=""
        className="grid gap-3 sm:grid-cols-3"
        onKeyDown={onKeyDown}
      >
        {platforms.map((platform, index) => {
          const isSelected = platform.id === selectedId;
          const comingSoon = platform.status === "coming-soon";
          const unsupported = platform.status === "unsupported";
          const statusId = `platform-status-${platform.id}`;

          return (
            <label
              key={platform.id}
              ref={(node) => {
                tileRefs.current[index] = node;
              }}
              tabIndex={isSelected ? 0 : -1}
              data-spotlight=""
              className={`glass relative flex cursor-pointer flex-col gap-2 rounded-lg p-5 ${
                isSelected ? "glass-selected" : ""
              } ${
                unsupported
                  ? "cursor-not-allowed opacity-60"
                  : "glass-interactive"
              }`}
              aria-describedby={comingSoon || unsupported ? statusId : undefined}
            >
              <input
                type="radio"
                name="platform"
                value={platform.id}
                checked={isSelected}
                disabled={unsupported}
                className="sr-only"
                onChange={() => setSelectedId(platform.id)}
              />
              <span className="flex items-center justify-between">
                <span className="text-md uppercase tracking-[0.08em] text-text-tertiary">
                  {osGlyphs[platform.id]}
                </span>
                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-text-inverse"
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : null}
              </span>
              <span className="text-md font-medium text-text-primary">
                {platform.name}
              </span>
              {comingSoon ? (
                <span id={statusId}>
                  <StatusBadge tone="warn">Coming soon</StatusBadge>
                </span>
              ) : null}
              {unsupported ? (
                <span id={statusId} className="text-md text-text-tertiary">
                  Splic doesn&apos;t support this system yet.
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      {selected ? (
        <div data-reveal="" className="glass mt-8 rounded-lg p-6 lg:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">
            {selected.name}
          </h2>

          {selected.status === "available" && selected.url ? (
            <>
              <div className="mt-5">
                <Button
                  href={selected.url}
                  size="lg"
                  {...(selected.formats.length > 0
                    ? { download: "" }
                    : { download: "" })}
                >
                  Download for {selected.name}
                </Button>
              </div>
              <p className="mt-4 font-mono text-md text-text-tertiary">
                {[
                  selected.version ? `Version ${selected.version}` : null,
                  selected.releaseDate
                    ? `Released ${selected.releaseDate}`
                    : null,
                  selected.arch.length > 0 ? selected.arch.join(" · ") : null,
                  selected.formats.length > 0
                    ? selected.formats.join(" · ")
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {selected.minOS || selected.requirements.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-md uppercase tracking-[0.08em] text-text-tertiary">
                    System requirements
                  </h3>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {selected.minOS ? (
                      <li className="text-md text-text-secondary">
                        {selected.minOS}
                      </li>
                    ) : null}
                    {selected.requirements.map((requirement) => (
                      <li
                        key={requirement}
                        className="text-md text-text-secondary"
                      >
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {selected.checksum ? (
                <div className="mt-6">
                  <h3 className="text-md uppercase tracking-[0.08em] text-text-tertiary">
                    Verify your download
                  </h3>
                  <p className="mt-2 font-mono text-md text-text-secondary">
                    {selected.checksum.algorithm}: {selected.checksum.value}
                  </p>
                </div>
              ) : null}
            </>
          ) : selected.status === "coming-soon" ? (
            <p className="mt-4 text-md text-text-secondary">
              A {selected.name} installer isn&apos;t available yet. Splic is in
              development — join early access and we&apos;ll tell you when it
              is.
            </p>
          ) : (
            <p className="mt-4 text-md text-text-secondary">
              Splic doesn&apos;t support this system yet.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-8 text-md text-text-secondary">
          Splic is a desktop app. Open this page on your computer to choose
          your operating system.
        </p>
      )}
    </div>
  );
}

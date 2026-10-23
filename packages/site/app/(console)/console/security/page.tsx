import type { Metadata } from "next";
import {
  KeyRound,
  LockKeyhole,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/console/format";
import { previewConsoleData } from "@/lib/console/preview-data";

export const metadata: Metadata = {
  title: "Security",
};

export default function ConsoleSecurityPage() {
  const data = previewConsoleData;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Security"
        description="Account identity and sign-in information."
        sample
      />

      <ContextualAlert
        tone="warning"
        title="Security actions are not connected"
        description="This preview cannot change passwords, revoke sessions or sign you out. Never treat preview controls as confirmation that a security action succeeded."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              aria-hidden="true"
              className="h-4 w-4 text-text-secondary"
              strokeWidth={1.8}
            />
            <h2 className="text-md font-medium text-text-primary">
              Account identity
            </h2>
          </div>
          <dl className="mt-4 divide-y divide-border-subtle">
            <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
              <dt className="text-sm text-text-tertiary">Name</dt>
              <dd className="text-right text-md text-text-primary">
                {data.account.name}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="text-sm text-text-tertiary">Email</dt>
              <dd className="break-all text-right text-md text-text-primary">
                {data.account.email}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="text-sm text-text-tertiary">Sign-in method</dt>
              <dd className="text-right text-md text-text-primary">
                {data.account.signInMethod}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3 last:pb-0">
              <dt className="text-sm text-text-tertiary">Member since</dt>
              <dd className="text-right text-md text-text-primary">
                {formatDate(data.account.memberSince)}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-2.5">
            <KeyRound
              aria-hidden="true"
              className="h-4 w-4 text-text-secondary"
              strokeWidth={1.8}
            />
            <h2 className="text-md font-medium text-text-primary">
              Sign-in and password
            </h2>
          </div>
          <p className="mt-3 text-sm leading-5 text-text-secondary">
            Password management and provider controls require an authentication
            backend. This preview has no password form and no provider session
            to manage.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" disabled>
              Change password
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Manage sign-in provider
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-2.5">
            <MonitorSmartphone
              aria-hidden="true"
              className="h-4 w-4 text-text-secondary"
              strokeWidth={1.8}
            />
            <div>
              <h2 className="text-md font-medium text-text-primary">
                Active sessions
              </h2>
              <p className="mt-0.5 text-sm text-text-tertiary">
                Sample devices. Revocation is not connected.
              </p>
            </div>
          </div>
          <StatusBadge tone="neutral">Sample</StatusBadge>
        </div>

        <ul className="divide-y divide-border-subtle">
          {data.sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-md text-text-primary">{session.device}</p>
                  {session.current ? (
                    <StatusBadge tone="ok">This device</StatusBadge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  {session.location} · Last active{" "}
                  {formatDateTime(session.lastActive)}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled
                title="Session revocation is not connected in this preview"
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle bg-surface-raised/40 px-5 py-3">
          <p className="text-xs text-text-tertiary">
            Session data is a preview fixture. A live Console must confirm
            revocation on the server.
          </p>
          <Button variant="ghost" size="sm" disabled>
            <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center gap-2.5">
            <LockKeyhole
              aria-hidden="true"
              className="h-4 w-4 text-text-secondary"
              strokeWidth={1.8}
            />
            <h2 className="text-md font-medium text-text-primary">
              Sessions and devices
            </h2>
          </div>
          <p className="mt-2 text-sm leading-5 text-text-secondary">
            Listing and revoking real devices requires a server-side session
            store. This preview does not pretend to provide one.
          </p>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              aria-hidden="true"
              className="h-4 w-4 text-text-secondary"
              strokeWidth={1.8}
            />
            <h2 className="text-md font-medium text-text-primary">
              Sensitive data
            </h2>
          </div>
          <p className="mt-2 text-sm leading-5 text-text-secondary">
            Access tokens, refresh tokens and secrets are never shown in the
            Console. Account security actions must use a trusted backend flow.
          </p>
        </Panel>
      </div>
    </div>
  );
}

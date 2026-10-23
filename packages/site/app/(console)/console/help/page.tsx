import type { Metadata } from "next";
import {
  BookOpen,
  ExternalLink,
  GitBranch,
  LifeBuoy,
  Mail,
  ReceiptText,
} from "lucide-react";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { ContextualAlert } from "@/components/console/contextual-alert";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/content/faq";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Help & Support",
};

export default function ConsoleHelpPage() {
  const docs = siteConfig.links.docs;
  const contact = siteConfig.links.contact;
  const helpFaqs = faqs.slice(0, 6).map(({ id, question, answer }) => ({
    id,
    question,
    answer,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Help & Support"
        description="Product documentation, answers and ways to reach the team."
      />

      {!docs || !contact ? (
        <ContextualAlert
          tone="info"
          title="Some support destinations aren't configured yet"
          description="Documentation and email support links appear only when NEXT_PUBLIC_DOCS_URL and NEXT_PUBLIC_CONTACT_EMAIL are set. This preview does not invent support addresses."
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="flex flex-col p-5">
          <BookOpen
            aria-hidden="true"
            className="h-4 w-4 text-text-secondary"
            strokeWidth={1.8}
          />
          <h2 className="mt-3 text-md font-medium text-text-primary">
            Documentation
          </h2>
          <p className="mt-1 flex-1 text-sm text-text-secondary">
            {docs
              ? "Read product guides and reference material."
              : "Documentation isn't configured yet."}
          </p>
          <div className="mt-4">
            {docs ? (
              <Button
                href={docs}
                variant="secondary"
                size="sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open docs
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                Not available
              </Button>
            )}
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <Mail
            aria-hidden="true"
            className="h-4 w-4 text-text-secondary"
            strokeWidth={1.8}
          />
          <h2 className="mt-3 text-md font-medium text-text-primary">
            Contact
          </h2>
          <p className="mt-1 flex-1 text-sm text-text-secondary">
            {contact
              ? "Email the Splic team about your account."
              : "Contact details are announced at launch."}
          </p>
          <div className="mt-4">
            {contact ? (
              <Button href={contact} variant="secondary" size="sm">
                Email support
              </Button>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                Not configured
              </Button>
            )}
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <GitBranch
            aria-hidden="true"
            className="h-4 w-4 text-text-secondary"
            strokeWidth={1.8}
          />
          <h2 className="mt-3 text-md font-medium text-text-primary">
            Project repository
          </h2>
          <p className="mt-1 flex-1 text-sm text-text-secondary">
            Follow development, report issues and open pull requests.
          </p>
          <div className="mt-4">
            <Button
              href={siteConfig.links.repository}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open GitHub
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <ReceiptText
            aria-hidden="true"
            className="h-4 w-4 text-text-secondary"
            strokeWidth={1.8}
          />
          <h2 className="mt-3 text-md font-medium text-text-primary">
            Plans and billing
          </h2>
          <p className="mt-1 flex-1 text-sm text-text-secondary">
            Compare editing plans and cloud storage options.
          </p>
          <div className="mt-4">
            <Button href="/pricing" variant="secondary" size="sm">
              View pricing
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex items-start gap-2.5">
          <LifeBuoy
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 text-text-secondary"
            strokeWidth={1.8}
          />
          <div>
            <h2 className="text-md font-medium text-text-primary">
              Frequently asked questions
            </h2>
            <p className="mt-0.5 text-sm text-text-tertiary">
              Answers published on the Splic marketing site.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <FaqAccordion items={helpFaqs} idPrefix="console-help" />
        </div>
      </Panel>
    </div>
  );
}

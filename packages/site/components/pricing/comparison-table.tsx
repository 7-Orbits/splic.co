import type { EditingPlan } from "@/content/pricing";

interface ComparisonTableProps {
  plans: EditingPlan[];
}

/**
 * Full comparison table. Horizontally scrollable inside a focusable,
 * labelled region; first column sticky. Hidden on small screens where the
 * plan cards already list each plan's entitlements.
 */
export function ComparisonTable({ plans }: ComparisonTableProps) {
  const rows: Array<{ label: string; values: string[] }> = [];

  const maxEntitlements = Math.max(
    ...plans.map((plan) => plan.entitlements.length),
  );
  for (let i = 0; i < maxEntitlements; i += 1) {
    rows.push({
      label: plans[0].entitlements[i]?.label ?? "",
      values: plans.map((plan) => {
        const entitlement = plan.entitlements[i];
        if (!entitlement) return "—";
        return entitlement.confirmed
          ? entitlement.value
          : "Announced at launch";
      }),
    });
  }

  return (
    <div className="hidden md:block">
      <div
        tabIndex={0}
        role="region"
        aria-label="Plan comparison table — scroll horizontally to compare all plans"
        className="glass overflow-x-auto rounded-lg"
      >
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">
            Editing plan entitlement comparison. Pricing is not final.
          </caption>
          <thead>
            <tr className="border-b border-border-subtle bg-surface-raised">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-surface-raised px-4 py-3 text-md font-medium text-text-tertiary"
              >
                <span className="sr-only">Entitlement</span>
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className="px-4 py-3 text-md font-semibold text-text-primary"
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-subtle">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-surface-base px-4 py-3 text-md font-normal text-text-tertiary"
              >
                Price
              </th>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-md text-text-primary">
                  {!plan.confirmed || plan.priceMonthly === null
                    ? "Announced at launch"
                    : plan.priceMonthly === 0
                      ? "$0"
                      : `$${plan.priceMonthly}/month`}
                </td>
              ))}
            </tr>
            {rows.map((row, index) => (
              <tr
                key={`${row.label}-${index}`}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface-elevated"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface-base px-4 py-3 text-md font-normal text-text-tertiary"
                >
                  {row.label}
                </th>
                {row.values.map((value, valueIndex) => (
                  <td
                    key={`${plans[valueIndex].id}-${value}`}
                    className="px-4 py-3 text-md text-text-secondary"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

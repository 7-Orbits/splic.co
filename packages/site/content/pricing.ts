/**
 * Pricing configuration.
 *
 * Every plan and storage tier carries `confirmed: false` while numbers are
 * draft. The pricing page replaces unconfirmed prices and quotas with
 * "Announced at launch", hides checkout CTAs in favour of early access, and
 * withholds entitlement explanations that depend on unconfirmed policy.
 */

export interface PlanEntitlement {
  label: string;
  value: string;
  confirmed: boolean;
}

export interface EditingPlan {
  id: string;
  name: string;
  /** Monthly price in USD. Null while unconfirmed. */
  priceMonthly: number | null;
  confirmed: boolean;
  audience: string;
  entitlements: PlanEntitlement[];
  cta: "download" | "choose";
}

export interface PremiumPlusPlan {
  id: string;
  name: string;
  description: string;
  confirmed: boolean;
}

export interface StorageTier {
  id: string;
  planName: string;
  /** Monthly price in USD for the add-on. Null while unconfirmed. */
  priceMonthly: number | null;
  /** Storage amount. Null renders "Announced at launch". */
  quota: string | null;
  confirmed: boolean;
}

export const pricingNotice = "Pricing is not final.";

export const editingPlans: EditingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    confirmed: false,
    audience: "For trying Splic and editing by hand.",
    entitlements: [
      { label: "Editor", value: "Full manual editor", confirmed: true },
      { label: "Agent usage", value: "See plan details", confirmed: false },
      {
        label: "Included cloud storage",
        value: "Announced at launch",
        confirmed: false,
      },
      {
        label: "Paid plugin access",
        value: "Free plugins only",
        confirmed: false,
      },
    ],
    cta: "download",
  },
  {
    id: "basic",
    name: "Basic",
    priceMonthly: 39,
    confirmed: false,
    audience: "For regular creators who want agent help.",
    entitlements: [
      { label: "Editor", value: "Entire editor", confirmed: true },
      {
        label: "Agent usage",
        value: "3 million tokens",
        confirmed: false,
      },
      {
        label: "Included cloud storage",
        value: "Announced at launch",
        confirmed: false,
      },
      {
        label: "Paid plugin access",
        value: "1 paid plugin per month",
        confirmed: false,
      },
    ],
    cta: "choose",
  },
  {
    id: "standard",
    name: "Standard",
    priceMonthly: 79,
    confirmed: false,
    audience: "For creators shipping video every week.",
    entitlements: [
      { label: "Editor", value: "Entire editor", confirmed: true },
      {
        label: "Agent usage",
        value: "10 million tokens",
        confirmed: false,
      },
      {
        label: "Included cloud storage",
        value: "Announced at launch",
        confirmed: false,
      },
      {
        label: "Paid plugin access",
        value: "5 paid plugins per month",
        confirmed: false,
      },
    ],
    cta: "choose",
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: 139,
    confirmed: false,
    audience: "For heavy use and larger projects.",
    entitlements: [
      { label: "Editor", value: "Entire editor", confirmed: true },
      {
        label: "Agent usage",
        value: "40 million tokens",
        confirmed: false,
      },
      {
        label: "Included cloud storage",
        value: "Announced at launch",
        confirmed: false,
      },
      {
        label: "Paid plugin access",
        value: "10 paid plugins per month",
        confirmed: false,
      },
    ],
    cta: "choose",
  },
];

export const premiumPlus: PremiumPlusPlan = {
  id: "premium-plus",
  name: "Premium+",
  description: "Need more? Premium+ is for teams and heavy use.",
  confirmed: false,
};

export const storageTiers: StorageTier[] = [
  {
    id: "storage-basic",
    planName: "Basic",
    priceMonthly: 9,
    quota: null,
    confirmed: false,
  },
  {
    id: "storage-standard",
    planName: "Standard",
    priceMonthly: 19,
    quota: null,
    confirmed: false,
  },
  {
    id: "storage-premium",
    planName: "Premium",
    priceMonthly: 39,
    quota: null,
    confirmed: false,
  },
];

export const lowestConfirmedPaidPrice: number | null = (() => {
  const confirmed = editingPlans
    .filter((plan) => plan.confirmed && plan.priceMonthly !== null && plan.priceMonthly > 0)
    .map((plan) => plan.priceMonthly as number);
  return confirmed.length > 0 ? Math.min(...confirmed) : null;
})();

export const anyPricingConfirmed = editingPlans.some((plan) => plan.confirmed);

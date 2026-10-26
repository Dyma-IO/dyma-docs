import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Dyma UTXO's sidebar (DOCS_EDITION=utxo, docs-utxo/). Pages keep the ids of Dyma's equivalent
 * pages (earners/wallets, projects/automatic-escrow…), so the partials both sites share in
 * docs-shared/ link to the right page on each site.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      items: ['getting-started/overview'],
    },
    {
      type: 'category',
      label: 'For earners',
      items: [
        'earners/how-it-works',
        'earners/wallets',
        'earners/quests-on-cardano',
        'earners/recurring-quests',
        'earners/claim-a-reward',
        'earners/reputation-and-boosts',
        'earners/reputation-badge',
        'earners/invite-friends',
      ],
    },
    {
      type: 'category',
      label: 'For projects',
      items: [
        'projects/getting-started',
        'projects/campaign-lifecycle',
        'projects/reward-tokens',
        'projects/distribution',
        'projects/automatic-escrow',
        'projects/funding-step-by-step',
        'projects/manual-payouts',
        'projects/exports',
        'projects/billing',
        'projects/integrations',
        'projects/rest-verification',
        'projects/ai-review',
      ],
    },
    {
      type: 'category',
      label: 'Smart contracts',
      items: ['contracts/overview', 'contracts/deployments'],
    },
    {
      type: 'category',
      label: 'Operators',
      items: [
        'operators/environment',
        'operators/deployment',
        'operators/escrow-operations',
        'operators/billing-settings',
        'operators/ai-review',
        'platform/integrations',
      ],
    },
    'roadmap',
  ],
};

export default sidebars;

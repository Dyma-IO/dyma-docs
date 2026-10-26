import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

/**
 * One repository, two documentation sites, chosen at build time with DOCS_EDITION:
 *
 * - unset (or `cosmos`): Dyma's site, built exactly as before editions existed (docs/,
 *   sidebars.ts, src/pages, static/);
 * - `utxo`: Dyma UTXO's site (docs-utxo/, sidebars-utxo.ts, src/pages-utxo, static-utxo/).
 *
 * Pages both sites share are written once in docs-shared/ and imported by both trees. Any other
 * value fails the build, so a typo never publishes the wrong site.
 */
type DocsEdition = 'cosmos' | 'utxo';

function docsEdition(value: string | undefined): DocsEdition {
  const edition = value?.trim().toLowerCase() ?? '';
  if (edition === '' || edition === 'cosmos') return 'cosmos';
  if (edition === 'utxo') return 'utxo';
  throw new Error(`Unknown DOCS_EDITION "${value}": leave it unset for Dyma, or set it to "utxo" for Dyma UTXO.`);
}

const dyma: Config = {
  title: 'Dyma Docs',
  tagline: 'Do the task. Own the proof.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  // url/baseUrl default to the GitHub Pages target; override via env for other
  // hosts (e.g. testnet served at a subdomain root: DOCS_URL + DOCS_BASE_URL=/).
  url: process.env.DOCS_URL ?? 'https://dyma-io.github.io',
  baseUrl: process.env.DOCS_BASE_URL ?? '/dyma-docs/',
  organizationName: 'Dyma-IO',
  projectName: 'dyma-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Dyma-IO/dyma-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Dyma Docs',
      logo: {
        alt: 'Dyma',
        src: 'img/dyma-icon.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://dyma.io',
          label: 'Website',
          position: 'left',
        },
        {
          href: 'https://github.com/orgs/Dyma-IO/discussions',
          label: 'Community',
          position: 'right',
        },
        {
          href: 'https://github.com/Dyma-IO/dyma-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'For earners', to: '/docs/earners/how-it-works'},
            {label: 'For projects', to: '/docs/projects/getting-started'},
            {label: 'Smart contracts', to: '/docs/contracts/overview'},
            {label: 'Operators', to: '/docs/operators/environment'},
          ],
        },
        {
          title: 'Product',
          items: [
            {label: 'dyma.io', href: 'https://dyma.io'},
            {label: 'Earner app', href: 'https://app.dyma.io'},
            {label: 'Studio', href: 'https://studio.dyma.io'},
            {label: 'Developers', to: '/docs/developers/repositories'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Discussions', href: 'https://github.com/orgs/Dyma-IO/discussions'},
            {label: 'X', href: 'https://x.com/dyma_io'},
            {label: 'Contributing', to: '/docs/developers/contributing'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Dyma IO. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

/**
 * Dyma UTXO's domain, for its links (landing, earner app, Studio) and its contact address:
 * DOCS_SITE_DOMAIN when set, else the registrable part of DOCS_URL's host, its last two labels
 * (docs.example.io gives example.io), as Studio derives its own contact address. The domain is
 * never written in this repository.
 */
function utxoSiteDomain(docsUrl: string): string {
  const explicit = process.env.DOCS_SITE_DOMAIN?.trim().toLowerCase();
  if (explicit) return explicit;
  const host = new URL(docsUrl).hostname.toLowerCase();
  if (!host.includes('.') || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return host;
  return host.split('.').slice(-2).join('.');
}

/** What Dyma UTXO's pages read from the site config (`src/components/Edition`). */
export type UtxoSiteFields = {
  edition: 'utxo';
  /** e.g. example.io: the landing page lives at its root, the apps on its subdomains. */
  siteDomain: string;
  /** The single contact address the site shows (support, billing, security, privacy). */
  contactEmail: string;
  /** Shown next to it wherever contact details are listed. */
  secondContactEmail: string;
  contractsRepoUrl: string;
};

const DISCUSSIONS_URL = 'https://github.com/orgs/Dyma-IO/discussions';
const CARDANO_CONTRACTS_REPO_URL = 'https://github.com/Dyma-IO/dyma-contracts-cardano';

/**
 * Dyma UTXO's site: Dyma's theme and build rules with its own pages, sidebar, homepage, static
 * files, names and links. No link points at Dyma's site, and there is no "Edit this page" link.
 */
function utxoEditionConfig(base: Config): Config {
  const docsUrl = process.env.DOCS_URL?.trim();
  if (!docsUrl) {
    throw new Error(
      'DOCS_EDITION=utxo needs DOCS_URL (https://docs.<domain>): the site\'s links and contact address come from it.',
    );
  }
  const domain = utxoSiteDomain(docsUrl);
  const at = (subdomain?: string) => `https://${subdomain ? `${subdomain}.` : ''}${domain}`;
  const fields: UtxoSiteFields = {
    edition: 'utxo',
    siteDomain: domain,
    contactEmail: `hello@${domain}`,
    secondContactEmail: 'dymaweb3@gmail.com',
    contractsRepoUrl: CARDANO_CONTRACTS_REPO_URL,
  };

  return {
    ...base,
    title: 'Dyma UTXO Docs',
    tagline: 'Quests and rewards for the Cardano ecosystem',
    favicon: 'img/dyma-utxo-favicon.svg',
    url: docsUrl,
    baseUrl: process.env.DOCS_BASE_URL ?? '/',
    staticDirectories: ['static-utxo'],
    customFields: fields,

    presets: [
      [
        'classic',
        {
          docs: {
            path: 'docs-utxo',
            sidebarPath: './sidebars-utxo.ts',
          },
          blog: false,
          pages: {
            path: 'src/pages-utxo',
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        } satisfies Preset.Options,
      ],
    ],

    themeConfig: {
      ...(base.themeConfig as Preset.ThemeConfig),
      navbar: {
        title: 'Docs',
        logo: {
          alt: 'Dyma UTXO',
          src: 'img/dyma-utxo-lockup.svg',
          srcDark: 'img/dyma-utxo-lockup-on-dark.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: at(),
            label: 'Website',
            position: 'left',
          },
          {
            href: DISCUSSIONS_URL,
            label: 'Community',
            position: 'right',
          },
          {
            href: CARDANO_CONTRACTS_REPO_URL,
            label: 'Contracts',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {label: 'Introduction', to: '/docs/intro'},
              {label: 'For earners', to: '/docs/earners/how-it-works'},
              {label: 'For projects', to: '/docs/projects/getting-started'},
              {label: 'Smart contracts', to: '/docs/contracts/overview'},
              {label: 'Operators', to: '/docs/operators/environment'},
            ],
          },
          {
            title: 'Product',
            items: [
              {label: domain, href: at()},
              {label: 'Earner app', href: at('app')},
              {label: 'Studio', href: at('studio')},
              {label: 'Roadmap', to: '/docs/roadmap'},
            ],
          },
          {
            title: 'Community',
            items: [
              {label: 'Discussions', href: DISCUSSIONS_URL},
              {label: 'Cardano contracts', href: CARDANO_CONTRACTS_REPO_URL},
            ],
          },
          {
            title: 'Contact',
            items: [
              {label: fields.contactEmail, href: `mailto:${fields.contactEmail}`},
              {label: fields.secondContactEmail, href: `mailto:${fields.secondContactEmail}`},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dyma IO. Built with Docusaurus.`,
      },
    } satisfies Preset.ThemeConfig,
  };
}

const config: Config = docsEdition(process.env.DOCS_EDITION) === 'utxo' ? utxoEditionConfig(dyma) : dyma;

export default config;

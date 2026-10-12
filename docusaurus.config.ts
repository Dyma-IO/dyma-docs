import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
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

export default config;

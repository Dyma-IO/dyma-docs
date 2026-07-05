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

  url: 'https://dyma-io.github.io',
  baseUrl: '/dyma-docs/',
  organizationName: 'Dyma-IO',
  projectName: 'dyma-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
            {label: 'Getting started', to: '/docs/getting-started/overview'},
            {label: 'Platform', to: '/docs/platform/topology'},
            {label: 'Developers', to: '/docs/developers/repositories'},
          ],
        },
        {
          title: 'Product',
          items: [
            {label: 'dyma.io', href: 'https://dyma.io'},
            {label: 'Studio', href: 'https://studio.dyma.io'},
            {label: 'API', href: 'https://api.dyma.io/docs'},
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

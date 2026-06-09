// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Kiro SRE Guide',
  tagline: 'Practical AI-assisted SRE with Kiro',
  favicon: 'img/favicon.ico',

  url: 'https://sreluger-group.gitlab.io',
  baseUrl: '/sreluger-project/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',    // docs at site root, no /docs/ prefix
        },
        blog: false,             // SRE guide has no blog
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Kiro SRE Guide',
        logo: {
          alt: 'SRE Team Logo',
          src: 'img/logo.svg',    // drop your org logo here
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Guide',
          },
          {
            href: 'https://kiro.dev',
            label: 'Kiro Docs',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Guide',
            items: [
              { label: 'Introduction', to: '/' },
              { label: 'Specs', to: '/specs' },
              { label: 'Agent Hooks', to: '/agent-hooks' },
              { label: 'Steering & Skills', to: '/steering-skills' },
              { label: 'MCP', to: '/mcp' },
            ],
          },
          {
            title: 'Reference',
            items: [
              { label: 'Kiro vs Claude Code', to: '/comparison' },
              { label: 'Best Practices', to: '/best-practices' },
              { label: 'Kiro Official Docs', href: 'https://kiro.dev' },
            ],
          },
        ],
        copyright: `SRE Team — Built with Docusaurus`,
      },
      prism: {
        // languages used in the guide
        additionalLanguages: ['bash', 'yaml', 'hcl', 'python', 'json'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

export default config;

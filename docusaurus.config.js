// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Kiro SRE Guide',
  tagline: 'Practical AI-assisted SRE with Kiro',
  favicon: 'img/favicon.ico',

  url: process.env.SITE_URL || 'https://infrsre.github.io',
  baseUrl: process.env.DOCUSAURUS_BASE_URL || '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  headTags: [
    {
      // CSP via meta tag — the only option on GitHub Pages (no custom HTTP headers).
      // 'unsafe-inline' is required for both script-src and style-src because
      // Docusaurus injects inline React hydration scripts and inline styles at build time.
      // frame-ancestors is intentionally omitted: browsers ignore it in meta tags —
      // it only works as an HTTP header (covered by nginx.conf for Docker/AWS deployments).
      tagName: 'meta',
      attributes: {
        'http-equiv': 'Content-Security-Policy',
        content: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data:",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    },
    {
      // Referrer-Policy can be set via meta tag (unlike X-Frame-Options / X-Content-Type-Options).
      tagName: 'meta',
      attributes: {
        name: 'referrer',
        content: 'strict-origin-when-cross-origin',
      },
    },
  ],

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
              { label: 'Tutorial: Your First Spec', to: '/tutorial-first-spec' },
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

// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sistema de Gestión Operativa para Bomberos',
  tagline: 'Documentación técnica del sistema integral de gestión para cuerpos de bomberos',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://marcelopazpezo.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/Bomberos/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'MarceloPazPezo', // Usually your GitHub org/user name.
  projectName: 'Bomberos', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/MarceloPazPezo/Bomberos/tree/docs/docs-site/',
        },

        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/logo_sistema.png',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Bomberos Docs',
        logo: {
          alt: 'Sistema Bomberos Logo',
          src: 'img/logo_sistema.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentación',
          },

          {
            href: 'https://github.com/MarceloPazPezo/Bomberos',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Documentación',
            items: [
              {
                label: 'Introducción',
                to: '/docs/intro',
              },
              {
                label: 'Instalación',
                to: '/docs/guias/instalacion-desarrollo',
              },
              {
                label: 'Arquitectura',
                to: '/docs/arquitectura',
              },
            ],
          },
          {
            title: 'Tecnologías',
            items: [
              {
                label: 'React',
                href: 'https://reactjs.org/',
              },
              {
                label: 'Node.js',
                href: 'https://nodejs.org/',
              },
              {
                label: 'PostgreSQL',
                href: 'https://www.postgresql.org/',
              },
            ],
          },
          {
            title: 'Más',
            items: [

              {
                label: 'GitHub',
                href: 'https://github.com/MarceloPazPezo/Bomberos',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sistema de Gestión Operativa para Bomberos. Desarrollado para mejorar la gestión operativa.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;

import type { Language } from './i18n';

export interface MenuItem {
  name: string;
  url: string;
  submenu?: MenuItem[];
}

export function getNavigationMenu(lang: Language, t: (key: string) => string): MenuItem[] {
  const prefix = lang === 'en' ? '' : `${lang}/`;

  return [
    {
      name: t('nav.greenhouses'),
      url: `/${prefix}greenhouses`,
      submenu: [
        { name: t('nav.highTech'), url: `/${prefix}greenhouses/high-tech` },
        { name: t('nav.accessories'), url: `/${prefix}greenhouses/accessories` },
      ]
    },
    {
      name: t('nav.irrigation'),
      url: `/${prefix}irrigation`,
      submenu: [
        { name: t('nav.dripSystems'), url: `/${prefix}irrigation/drip-systems` },
        { name: t('nav.sprinklers'), url: `/${prefix}irrigation/sprinklers` },
        { name: t('nav.controllers'), url: `/${prefix}irrigation/controllers` },
      ]
    },
    {
      name: t('nav.substrates'),
      url: `/${prefix}substrates`,
      submenu: [
        { name: t('nav.growingSolutions'), url: `/${prefix}substrates/growing-solutions` }
      ]
    },
    {
      name: t('nav.projects'),
      url: `/${prefix}projects`
    },
    { name: t('nav.company'), url: `/${prefix}company` },
    { name: t('nav.blog'), url: `/${prefix}blog` },
    { name: 'Contact', url: `/${prefix}contact` },
  ];
}

export const socialMediaLinks = [
  {
    name: 'Facebook',
    url: 'https://facebook.com/arbrebio',
    icon: 'fa-brands fa-facebook-f'
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/arbrebio',
    icon: 'fa-brands fa-twitter'
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/arbrebio',
    icon: 'fa-brands fa-linkedin-in'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/arbrebio',
    icon: 'fa-brands fa-instagram'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/arbrebio',
    icon: 'fa-brands fa-youtube'
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com/@arbrebio',
    icon: 'fa-brands fa-tiktok'
  }
];

export const whatsappLink = {
  name: 'WhatsApp',
  url: 'https://wa.me/2250799295643',
  icon: 'fa-brands fa-whatsapp'
};

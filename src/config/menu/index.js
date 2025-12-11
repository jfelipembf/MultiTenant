const menu = (branchSlug) => [
  {
    name: 'Dashboard',
    icon: 'ti-home',
    menuItems: [
      {
        name: 'Início',
        path: `/account/${branchSlug}`,
        icon: 'ti-dashboard',
      },
      {
        name: 'Integrações',
        path: `/account/${branchSlug}/integrations`,
        icon: 'ti-plug',
      },
    ],
  },
  {
    name: 'Configurações',
    icon: 'ti-settings',
    menuItems: [
      {
        name: 'Informações',
        path: `/account/${branchSlug}/settings/general`,
        icon: 'ti-info-alt',
      },
      {
        name: 'Domínio',
        path: `/account/${branchSlug}/settings/domain`,
        icon: 'ti-world',
      },
      {
        name: 'Equipe',
        path: `/account/${branchSlug}/settings/team`,
        icon: 'ti-user',
      },
      {
        name: 'Avançado',
        path: `/account/${branchSlug}/settings/advanced`,
        icon: 'ti-panel',
      },
    ],
  },
  {
    name: 'Academias',
    icon: 'ti-briefcase',
    menuItems: [
      {
        name: 'Todas as Academias',
        path: '/account/branches',
        icon: 'ti-list',
      },
    ],
  },
];

export default menu;

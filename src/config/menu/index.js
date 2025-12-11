const menu = (branchSlug) => {
  // Menu base que sempre aparece
  const baseMenu = [
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

  // Se não tem branchSlug, retorna apenas o menu base
  if (!branchSlug) {
    return baseMenu;
  }

  // Menu completo quando tem uma branch selecionada
  return [
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
    ...baseMenu,
  ];
};

export default menu;

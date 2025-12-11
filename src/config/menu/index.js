const menu = (branchSlug) => {
  // Menu quando NÃO tem academia selecionada (área geral do usuário)
  if (!branchSlug) {
    return [
      {
        name: 'Início',
        icon: 'ti-home',
        menuItems: [
          {
            name: 'Minhas Academias',
            path: '/account',
            icon: 'ti-dashboard',
          },
        ],
      },
      {
        name: 'Minha Conta',
        icon: 'ti-user',
        menuItems: [
          {
            name: 'Configurações',
            path: '/account/settings',
            icon: 'ti-settings',
          },
          {
            name: 'Faturamento',
            path: '/account/billing',
            icon: 'ti-credit-card',
          },
        ],
      },
    ];
  }

  // Menu quando TEM academia selecionada (área da academia)
  return [
    {
      name: 'Academia',
      icon: 'ti-home',
      menuItems: [
        {
          name: 'Dashboard',
          path: `/account/${branchSlug}`,
          icon: 'ti-dashboard',
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
      name: 'Voltar',
      icon: 'ti-arrow-left',
      menuItems: [
        {
          name: 'Minhas Academias',
          path: '/account',
          icon: 'ti-list',
        },
      ],
    },
  ];
};

export default menu;

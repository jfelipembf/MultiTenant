const menu = (branchSlug) => [
  {
    name: 'Academia',
    menuItems: [
      {
        name: 'Início',
        path: `/account/${branchSlug}`,
      },
      {
        name: 'Integrações',
        path: `/account/${branchSlug}/integrations`,
      },
    ],
  },
  {
    name: 'Configurações',
    menuItems: [
      {
        name: 'Informações',
        path: `/account/${branchSlug}/settings/general`,
      },
      {
        name: 'Domínio',
        path: `/account/${branchSlug}/settings/domain`,
      },
      {
        name: 'Equipe',
        path: `/account/${branchSlug}/settings/team`,
      },
      {
        name: 'Avançado',
        path: `/account/${branchSlug}/settings/advanced`,
      },
    ],
  },
];

export default menu;

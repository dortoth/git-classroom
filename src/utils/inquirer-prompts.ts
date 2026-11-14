// ===================== Login =====================

export const loginQuestion = [
  {
    type: 'rawlist',
    name: 'loginOptions',
    message: 'With which platform would you like to login?',
    choices: ['GitHub', 'GitLab', 'Nothing'],
  },
];

export const continueQuestion = [
  {
    type: 'input',
    name: 'proceed',
    message: 'Would you like to continue with the login? Press enter.',
  },
];

// ===================== Main Menu =====================

export const loadClassrooms = [
  {
    type: 'confirm',
    name: 'loadClassrooms',
    message: 'Would you like to load your classrooms?',
  },
];

export const returnToMainMenu = [
  {
    type: 'confirm',
    name: 'proceed',
    message: 'Would you like to return to the main menu? Press enter.',
  },
];

// ===================== Manage Members =====================

export const enterEmailOfNewUser = [
  {
    type: 'input',
    name: 'email',
    message:
      'Please enter the email(s) of the new member(s).\n If you want to add more than one person, please separate them by commas!\n',
  },
];

export function enterRole(provider: string) {
  const roles =
    provider === 'GitLab'
      ? [
          { name: 'Student', value: '30' },
          { name: 'Co Teacher', value: '40' },
          { name: 'Teacher', value: '50' },
        ]
      : [
          { name: 'Student', value: 'direct_member' },
          { name: 'Teacher', value: 'admin' },
        ];

  return [
    {
      type: 'rawlist',
      name: 'role',
      message: 'Please enter which role the new member should have.',
      choices: [...roles, { name: 'Return to menu', value: 'back' }],
    },
  ];
}

export const usernameOfDeletedUser = [
  {
    type: 'input',
    name: 'username',
    message:
      'Please enter the username(s) of the member(s) you want to remove.\n If you want to remove more than one person, please separate them by commas! \n',
  },
];

// ===================== Action Menus =====================

export type MenuAction = {
  name: string;
  value: () => unknown;
};

export function actionMenu(choices: MenuAction[], message = 'What would you like to do?') {
  return [
    {
      type: 'rawlist',
      name: 'action',
      message,
      choices,
    },
  ];
}

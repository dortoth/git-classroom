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

export const loadTeams = [
  {
    type: 'confirm',
    name: 'loadTeams',
    message: 'Would you like to load your teams?',
  },
];

export const menuQuestion = [
  {
    type: 'rawlist',
    name: 'menuOptions',
    message: 'What would you like to do?',
    choices: [
      { name: 'Manage team members', value: 'mom' },
      { name: 'Create Classroom', value: 'cc' },
      { name: 'Create Template Repository', value: 'ctp' },
      { name: 'Exit the application', value: 'exit' },
    ],
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

export const manageMembersOptions = [
  {
    type: 'rawlist',
    name: 'manageMembersOptions',
    message: 'What would you like to do?',
    choices: [
      { name: 'List team members', value: 'lom' },
      { name: 'Create an team invitation', value: 'coi' },
      { name: 'Remove an team member', value: 'rom' },
      { name: 'Return to Main Menu', value: 'rtm' },
    ],
  },
];

export const enterEmailOfNewUser = [
  {
    type: 'input',
    name: 'email',
    message:
      'Please enter the email(s) of the new member(s).\n If you want to add more than one person, please seperate them by commas!\n',
  },
];

export function enterRole(provider: string) {
  const roles =
    provider === 'GitLab'
      ? [
          { name: 'Guest', value: '10' },
          { name: 'Reporter', value: '20' },
          { name: 'Developer', value: '30' },
          { name: 'Maintainer', value: '40' },
          { name: 'Owner', value: '50' },
        ]
      : [
          { name: 'Direct Member', value: 'direct_member' },
          { name: 'Admin', value: 'admin' },
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
      'Please enter the username(s) of the member(s) you want to remove.\n If you want to remove more than one person, please seperate them by commas! \n',
  },
];

// ===================== Classroom =====================

export const classroomMenuOptions = [
  {
    type: 'rawlist',
    name: 'classroomsOptions',
    message: 'What would you like to do?',
    choices: [
      { name: 'List Classrooms' },
      { name: 'Create Classroom' },
      { name: 'Update Classroom' },
      { name: 'Delete Classroom' },
      { name: 'List Classroom Members of specific Classroom' },
      { name: 'Return to Main Menu' },
    ],
  },
];

// ===================== Template Repository =====================

export const templateRepoMenuOptions = [
  {
    type: 'rawlist',
    name: 'templateRepoOptions',
    message: 'What would you like to do?',
    choices: [
      { name: 'Create Template Repository' },
      { name: 'Assign a Repository to a Team' },
      { name: 'Edit A Repository' },
      { name: 'Return to Main Menu' },
    ],
  },
];

export const repoOptions = [
  {
    type: 'rawlist',
    name: 'repoOptions',
    message: 'What would you like to do?',
    choices: [
      { name: 'Create a pull request' },
      { name: 'Create or update file contents' },
      { name: 'Return to Template Repository Menu' },
    ],
  },
];

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
      { name: 'Create Assignment', value: 'ca' },
      { name: 'Exit the application', value: 'exit' },
    ],
  },
];

export const continueQuestion = [
  {
    type: 'input',
    name: 'proceed',
    message: 'Would you like to continue with the login? Press enter.',
  },
];

export const loginQuestion = [
  {
    type: 'rawlist',
    name: 'loginOptions',
    message: 'With which platform would you like to login?',
    choices: ['GitHub', 'GitLab', 'Nothing'],
  },
];

export const manageMembersOptions = [
  {
    type: 'rawlist',
    name: 'manageMembersOptions',
    message: 'What would you like to do?',
    choices: [
      { name: 'List team members', value: 'lom' },
      { name: 'Create an team invitation', value: 'coi' },
      { name: 'Remove an team member', value: 'rom' },
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

export const enterEmailOfNewUser = [
  {
    type: 'input',
    name: 'email',
    message:
      'Please enter the email(s) of the new member(s).\n If you want to add more than one person, please seperate them by commas!\n',
  },
];

export const enterRole = [
  {
    type: 'rawlist',
    name: 'role',
    message: 'Please enter which role the new memeber should have.',
    choices: [
      { name: 'Direct Memeber', value: 'direct_member' },
      { name: 'Admin', value: 'admin' },
      'Return to menu',
    ],
  },
];

export const usernameOfDeletedUser = [
  {
    type: 'input',
    name: 'username',
    message:
      'Please enter the username(s) of the member(s) you want to remove.\n If you want to remove more than one person, please seperate them by commas! \n',
  },
];

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
      { name: 'Manage organization members', value: 'mom' },
      { name: 'Create Classroom', value: 'cc' },
      { name: 'Create Template Repository', value: 'ctp' },
      { name: 'Create Assignment', value: 'ca' },
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
      { name: 'List organization memebers', value: 'lom' },
      { name: 'Create an organization invitation', value: 'coi' },
      { name: 'Remove an organization member', value: 'rom' },
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

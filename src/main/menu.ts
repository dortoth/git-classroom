import inquirer from 'inquirer';
import type { GitHubService } from '../api/github-service.js';
import type { GitLabService } from '../api/gitlab-service.js';
import type { Utils } from '../utils/utils.js';

const loadGitHubOrganization = [
  {
    type: 'confirm',
    name: 'loadOrg',
    message: 'Would you like to load your organization?',
  },
];

const loadGitLabGroup = [
  {
    type: 'confirm',
    name: 'loadGrp',
    message: 'Would you like to load your group?',
  },
];

const menuQuestion = [
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

export class Menu {
  private hubService!: GitHubService;
  private labService!: GitLabService;

  constructor(private readonly utils: Utils) {}

  setServices(hubService: GitHubService, labService: GitLabService) {
    this.hubService = hubService;
    this.labService = labService;
  }

  openMainMenu(provider: string, token: string) {
    console.clear();

    if (provider === 'GitHub') {
      inquirer.prompt(loadGitHubOrganization).then((answer) => {
        if (answer['loadOrg'] !== true) {
          process.exit(0);
        }
        this.hubService.loadExisitingGitHubOrganization(token);
      });
    } else {
      inquirer.prompt(loadGitLabGroup).then((answer) => {
        if (answer['loadGrp'] !== true) {
          process.exit(0);
        }
        this.labService.loadExisitingGitLabGroup();
      });
    }
  }

  // createClassroom (das Repo mit den Metadaten, also Roster und Assignments)
  // createTemplateRepository
  // createAssignment (aus dem Template ein Repo pro Studierendem)
  openGitHubOrganizationMenu(orgName: string, orgToken: string) {
    console.clear();
    inquirer
      .prompt(menuQuestion)
      .then(async (answer) => {
        if (answer['menuOptions'] == 'mom') {
          this.hubService.manageMembers(orgName, orgToken);
        } else if (answer['menuOptions'] == 'cc') {
          this.hubService.createClassroom();
        } else if (answer['menuOptions'] == 'ctp') {
          this.hubService.createTemplateRepository();
        } else {
          this.hubService.createAssignment();
        }
      })
      .catch((error) => {
        this.utils.logError(error);
      });
  }
}

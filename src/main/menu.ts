import inquirer from 'inquirer';
import { GitHubService } from '../api/github-service.js';
import { GitLabService } from '../api/gitlab-service.js';

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

export class Menu {
  private readonly hubService = new GitHubService();
  private readonly labService = new GitLabService();

  openMainMenu(provider: string, token: string) {
    console.clear();

    if (provider === 'GitHub') {
      inquirer.prompt(loadGitHubOrganization).then((answer) => {
        if (answer['loadOrg'] !== true) {
          process.exit(1);
        }
        this.hubService.loadExisitingGitHubOrganization(token);
      });
    } else {
      inquirer.prompt(loadGitLabGroup).then((answer) => {
        if (answer['loadGrp'] !== true) {
          process.exit(1);
        }
        this.labService.loadExisitingGitLabGroup();
      });
    }
  }

  openGitHubOrganizationMenu(orgName: string, orgToken: string) {
    console.log('Todo');
    // createClassroom (das Repo mit den Metadaten, also Roster und Assignments)
    // createTemplateRepository
    // createAssignment (aus dem Template ein Repo pro Studierendem)
    // manageMembers (Admins und User verwalten)
  }
}

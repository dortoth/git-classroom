import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import * as iP from '../utils/inquirerPrompt.js';
import * as util from '../utils/utils.js';

export class Menu {
  private hubService!: GitHubService;
  private labService!: GitLabService;

  constructor(private readonly utils: util.Utils) {}

  setServices(hubService: GitHubService, labService: GitLabService) {
    this.hubService = hubService;
    this.labService = labService;
  }

  openMainMenu(provider: string, token: string) {
    console.clear();

    if (provider === 'GitHub') {
      util.inquirer.prompt(iP.loadGitHubOrganization).then((answer) => {
        if (answer['loadOrg'] !== true) {
          process.exit(0);
        }
        this.hubService.loadExisitingGitHubOrganization(token);
      });
    } else {
      util.inquirer.prompt(iP.loadGitLabGroup).then((answer) => {
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
    util.inquirer
      .prompt(iP.menuQuestion)
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

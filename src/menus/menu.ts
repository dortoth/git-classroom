import axios from 'axios';
import type { IPlatform } from '../config/interfaces/iplatform.js';
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

  openMainMenu(platform: IPlatform) {
    console.clear();
    util.inquirer.prompt(iP.loadTeams).then((answer) => {
      if (answer['loadTeams'] !== true) {
        process.exit(0);
      }
      this.loadExisitingTeams(platform);
    });
  }

  async loadExisitingTeams(platform: IPlatform) {
    let data;
    if (platform.provider === 'GitHub') {
      data = await this.hubService.loadGithubOrganization(platform.token);
      if (data.length === 0) {
        console.log('Sorry there exist no organization. Please add one!');
        process.exit(1);
      }
      //for gitlab
      // else {
      //
      //   if (data.length === 0) {
      //     console.log('Sorry there exist no group. Please add one!');
      //     process.exit(1);
      //   }

      console.clear();
      await util.inquirer
        .prompt([
          {
            type: 'select',
            name: 'organization',
            message: 'Select a Team:',
            choices: data.map((team: { login: string }) => team.login),
          },
        ])
        .then(async (answer) => {
          platform.teamsUrl = answer['organization'];
          await this.openTeamMenu(platform);
        });
    } else {
      // GitLab-Gruppen folgen noch
      console.log('Sorry, loading GitLab groups is not supported yet.');
      process.exit(0);
    }
  }

  // createClassroom (das Repo mit den Metadaten, also Roster und Assignments)
  // createTemplateRepository
  // createAssignment (aus dem Template ein Repo pro Studierendem)
  openTeamMenu(platform: IPlatform) {
    console.clear();
    util.inquirer
      .prompt(iP.menuQuestion)
      .then(async (answer) => {
        if (answer['menuOptions'] == 'mom') {
          this.manageMembers(platform);
        } else if (answer['menuOptions'] == 'cc') {
          this.createClassroom();
        } else if (answer['menuOptions'] == 'ctp') {
          this.createTemplateRepository();
        } else {
          this.createAssignment();
        }
      })
      .catch((error) => {
        this.utils.logError(error);
      });
  }

  async manageMembers(platform: IPlatform) {
    await util.inquirer.prompt(iP.manageMembersOptions).then(async (answer) => {
      if (answer['manageMembersOptions'] == 'lom') {
        await this.listTeamMembers(platform);
      } else if (answer['manageMembersOptions'] == 'coi') {
      } else {
      }
    });
  }

  private async listTeamMembers(platform: IPlatform) {
    try {
      const members = await this.hubService.listOrgaMembers(platform);
      console.clear();
      const table = new util.table({ head: ['Username'] });
      members.forEach((member) => table.push([member.login]));
      console.log(table.toString());
      console.log('\n');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? `${error.response?.status} ${error.response?.statusText}`
        : error;
      this.utils.logError(message);
      await this.utils.wait(3000);
      return this.openTeamMenu(platform);
    }

    await util.inquirer.prompt(iP.returnToMainMenu).then((answer) => {
      if (answer['proceed'] === true) {
        this.openTeamMenu(platform);
      } else {
        console.log('The program will be terminated now.');
        process.exit(0);
      }
    });
  }

  async createClassroom() {}
  async createTemplateRepository() {}
  async createAssignment() {}
}

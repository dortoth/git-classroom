import type { IPlatform } from '../config/interfaces/platform.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import * as iP from '../utils/inquirer-prompts.js';
import * as util from '../utils/utils.js';
import type { ManageMembersMenu } from './manage-members-menu.js';
import { ClassroomMenu } from './classroom-menu.js';
import type { TemplateRepositoryMenu } from './template-repository-menu.js';

export class MainMenu {
  private hubService!: GitHubService;
  private labService!: GitLabService;

  constructor(
    private readonly utils: util.Utils,
    private readonly membersMenu: ManageMembersMenu,
    private readonly classroomMenu: ClassroomMenu,
    private readonly templateRepoMenu: TemplateRepositoryMenu,
  ) {}

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

  openTeamMenu(platform: IPlatform) {
    console.clear();
    util.inquirer
      .prompt(iP.menuQuestion)
      .then(async (answer) => {
        if (answer['menuOptions'] == 'mom') {
          this.membersMenu.manageMembers(platform);
        } else if (answer['menuOptions'] == 'cc') {
          this.openClassroomMenu(platform);
        } else if (answer['menuOptions'] == 'ctp') {
          this.openTemplateRepositoryMenu(platform);
        } else {
          console.log('The application will close now.');
          console.log('Return soon! ~meow');
          process.exit(0);
        }
      })
      .catch((error) => {
        this.utils.logError(error);
      });
  }

  async openClassroomMenu(platform: IPlatform) {
    console.clear();
    util.inquirer.prompt(iP.classroomMenuOptions).then(async (answer) => {
      if (answer['classroomsOptions'] == 'List Classrooms') {
        await this.classroomMenu.listClassrooms();
      } else if (answer['classroomsOptions'] == 'Create Classroom') {
        await this.classroomMenu.createClassroon();
      } else if (answer['classroomsOptions'] == 'Update Classroom') {
        await this.classroomMenu.updateClassroom();
      } else if (answer['classroomsOptions'] == 'Delete Classroom') {
        await this.classroomMenu.deleteClassroom();
      } else if (answer['classroomsOptions'] == 'List Classroom Members of specific Classroom') {
        await this.classroomMenu.listClassroomMembers();
      } else {
        this.openTeamMenu(platform);
      }
    });
  }

  async openTemplateRepositoryMenu(platform: IPlatform) {
    console.clear();
    util.inquirer.prompt(iP.templateRepoMenuOptions).then(async (answer) => {
      if (answer['templateRepoOptions'] == 'Create Template Repository') {
        await this.templateRepoMenu.createTemplateRepo();
      } else if (answer['templateRepoOptions'] == 'Assign a Repository to a Team') {
        await this.templateRepoMenu.assignRepoToTeam();
      } else if (answer['templateRepoOptions'] == 'Edit A Repository') {
        await this.openEditRepositoryOptions(platform);
      } else {
        this.openTeamMenu(platform);
      }
    });
  }

  private async openEditRepositoryOptions(platform: IPlatform) {
    console.clear();
    util.inquirer.prompt(iP.repoOptions).then(async (answer) => {
      if (answer['repoOptions'] == 'Create a pull request') {
        await this.templateRepoMenu.createPullRequest();
      } else if (answer['repoOptions'] == 'Create or update file contents') {
        await this.templateRepoMenu.createOrUpdateFile();
      } else {
        this.openTemplateRepositoryMenu(platform);
      }
    });
  }
}

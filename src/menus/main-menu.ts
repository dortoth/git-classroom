import type { IPlatform } from '../config/interfaces/platform.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import * as iP from '../utils/inquirer-prompts.js';
import * as util from '../utils/utils.js';
import type { ManageMembersMenu } from './manage-members-menu.js';
import type { TemplateRepositoryMenu } from './template-repository-menu.js';
import type { StudentRepositoryMenu } from './student-repository-menu.js';

export class MainMenu {
  private hubService!: GitHubService;
  private labService!: GitLabService;

  constructor(
    private readonly utils: util.Utils,
    private readonly membersMenu: ManageMembersMenu,
    private readonly studentRepository: StudentRepositoryMenu,
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
          await this.openClassroomMenu(platform);
        });
    } else {
      // GitLab-Gruppen folgen noch
      console.log('Sorry, loading GitLab groups is not supported yet.');
      process.exit(0);
    }
  }

  openClassroomMenu(platform: IPlatform) {
    console.clear();
    util.inquirer
      .prompt(
        iP.actionMenu([
          { name: 'Manage team members', value: () => this.membersMenu.manageMembers(platform) },
          {
            name: 'Manage Template Repository',
            value: () => this.openTemplateRepositoryMenu(platform),
          },
          {
            name: 'Manage Repository for Student',
            value: () => this.openStudentRepositoryMenu(platform),
          },
          { name: 'Exit the application', value: () => this.exitApplication() },
        ]),
      )
      .then((answer) => answer['action']())
      .catch((error) => {
        this.utils.logError(error);
      });
  }

  async openTemplateRepositoryMenu(platform: IPlatform) {
    console.clear();
    util.inquirer
      .prompt(
        iP.actionMenu([
          {
            name: 'Create Template Repository',
            value: () => this.templateRepoMenu.createTemplateRepo(),
          },
          {
            name: 'Edit a Repositorys Files or Settings',
            value: () => this.templateRepoMenu.createOrUpdateRepo(),
          },
          { name: 'Return to Classroom Menu', value: () => this.openClassroomMenu(platform) },
        ]),
      )
      .then((answer) => answer['action']());
  }

  async openStudentRepositoryMenu(platform: IPlatform) {
    console.clear();
    //List of Students laden
    util.inquirer
      .prompt(
        iP.actionMenu([
          {
            name: 'Create a new Repository for a Student out of a Template Repository',
            value: () => this.studentRepository.createARepoForAStudent(),
          },
          {
            name: 'Create a pull request for a repository of a student',
            value: () => this.studentRepository.createPullRequestForRepo(),
          },
          { name: 'Return to Classroom Menu', value: () => this.openClassroomMenu(platform) },
        ]),
      )
      .then((answer) => answer['action']());
  }

  private exitApplication() {
    console.log('The application will close now.');
    console.log('Return soon! ~meow');
    process.exit(0);
  }
}

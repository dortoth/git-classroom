import type { IPlatform } from '../config/interfaces/platform.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import * as iP from '../utils/inquirer-prompts.js';
import * as util from '../utils/utils.js';
import type { ManageMembersMenu } from './manage-members-menu.js';
import type { TemplateRepositoryMenu } from './template-repository-menu.js';
import type { StudentRepositoryMenu } from './student-repository-menu.js';

export class MainMenu {
  constructor(
    private readonly utils: util.Utils,
    private readonly membersMenu: ManageMembersMenu,
    private readonly studentRepository: StudentRepositoryMenu,
    private readonly templateRepoMenu: TemplateRepositoryMenu,
    private readonly hubService: GitHubService,
    private readonly labService: GitLabService,
  ) {}

  async openMainMenu(platform: IPlatform) {
    console.clear();
    await util.inquirer.prompt(iP.loadClassrooms).then(async (answer) => {
      if (answer['loadClassrooms'] !== true) {
        process.exit(0);
      }
      await this.loadExistingClassrooms(platform);
    });
  }

  async loadExistingClassrooms(platform: IPlatform) {
    let data;
    if (platform.provider === 'GitHub') {
      try {
        data = await this.hubService.loadGithubOrganization(platform.token);
      } catch (error) {
        this.utils.logError(error);
        process.exit(1);
      }

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
            message: 'Select a Classroom:',
            choices: data.map((classroom: { login: string; url: string }) => ({
              name: `${classroom.login} (${classroom.url})`,
              value: classroom.login,
            })),
          },
        ])
        .then(async (answer) => {
          platform.classroomUrl = answer['organization'];
          await this.openClassroomMenu(platform);
        });
    } else {
      // GitLab-Gruppen folgen noch
      console.log('Sorry, loading GitLab groups is not supported yet.');
      process.exit(0);
    }
  }

  async openClassroomMenu(platform: IPlatform) {
    console.clear();
    await util.inquirer
      .prompt(
        iP.actionMenu([
          {
            name: 'Manage classroom members',
            value: () => this.membersMenu.manageMembers(platform),
          },
          {
            name: 'Manage Template Repository',
            value: () => this.templateRepoMenu.openTemplateRepositoryMenu(platform),
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

  async openStudentRepositoryMenu(platform: IPlatform) {
    console.clear();
    //List of Students laden
    await util.inquirer
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
    this.utils.exitApplication();
  }
}

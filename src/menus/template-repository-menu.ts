import * as util from '../utils/utils.js';
import * as iP from '../utils/inquirer-prompts.js';
import type { IPlatform } from '../config/interfaces/platform.js';
import type { MainMenu } from './main-menu.js';
import type { GitHubService } from '../services/github-service.js';

export class TemplateRepositoryMenu {
  private mainMenu!: MainMenu;

  constructor(
    private readonly hubService: GitHubService,
    private readonly util: util.Utils,
  ) {}

  setMainMenu(menu: MainMenu) {
    this.mainMenu = menu;
  }

  async openTemplateRepositoryMenu(platform: IPlatform) {
    console.clear();
    await util.inquirer
      .prompt(
        iP.actionMenu([
          {
            name: 'Create Template Repository',
            value: () => this.createTemplateRepo(platform),
          },
          {
            name: "Edit a Repository's Files",
            value: () => this.listAllReposAndUpdate(platform),
          },
          {
            name: 'Return to Classroom Menu',
            value: () => this.mainMenu.openClassroomMenu(platform),
          },
        ]),
      )
      .then((answer) => answer['action']());
  }

  public async createTemplateRepo(platform: IPlatform) {
    console.clear();
    await util.inquirer.prompt(iP.enterNameOfTempalteRepo).then(async (answer) => {
      if (answer['templateRepo'] === '') {
        console.log(`Sorry the template name cant be empty - please try again!`);
        await this.util.wait(2000);
        await this.openTemplateRepositoryMenu(platform);
      }
      try {
        await this.hubService.createTemplateRepository(platform, answer['templateRepo']);
        console.log(
          `Template Repository sucessfully created. Tempalte Repository Menu will open soon.`,
        );
        await this.util.wait(2500);
        await this.openTemplateRepositoryMenu(platform);
      } catch (error) {
        console.log(`Sorry that didnt work - please try again!`);
        await this.util.wait(2000);
        await this.openTemplateRepositoryMenu(platform);
      }
    });
  }

  public async listAllReposAndUpdate(platform: IPlatform) {
    console.clear();
    let data;
    try {
      data = await this.hubService.loadAllTemplateRepos(platform);
    } catch (error) {
      this.util.logError(error);
      process.exit(1);
    }

    if (data.length === 0) {
      console.log('Sorry there exist no template repository. Please add one!');
      process.exit(1);
    }

    const tempalteRepos = await util.inquirer.prompt([
      {
        type: 'select',
        name: 'tempalteRepo',
        message: 'Select a Template Repo:',
        choices: data.map((templateRepo: { name: string }) => templateRepo.name),
      },
    ]);

    try {
      const repoName = tempalteRepos['tempalteRepo'];
      const res = await this.hubService.listAllContestOfRepo(platform, repoName);
    } catch (error) {
      this.util.logError(error);
      process.exit(1);
    }
  }

  private async listAllFilesAndEdit(owner: string, repoName: string, path: string) {
    await util.inquirer
      .prompt([
        {
          type: 'select',
          name: 'file',
          message: 'Select a File:',
          choices: data.map((file: { name: string }) => file.name),
        },
      ])
      .then(async (answer) => {
        const fileName = answer['file'];
        const owner = data[0].owner.login;
        try {
          await this.hubService.listAllContestOfRepo(owner, repoName);
        } catch (error) {
          this.util.logError(error);
          process.exit(1);
        }
      });
  }
}

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
            name: "Add or Edit a Repository's Files",
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
        const shouldHaveReadme = await util.inquirer.prompt(iP.emptyTemplateRepi);
        let isTemplate = false;
        let data;

        if (!shouldHaveReadme) {
          data = await this.hubService.createTemplateRepository(
            platform,
            answer['templateRepo'],
            isTemplate,
          );
        } else {
          data = await this.hubService.createTemplateRepository(
            platform,
            answer['templateRepo'],
            (isTemplate = true),
          );
        }

        console.log(`Template Repository sucessfully created. (${data.html_url})`);
        await this.util.askReturnOrExit(
          () => this.openTemplateRepositoryMenu(platform),
          'Template Repository Menu',
        );
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
      console.log(`Sorry there was a error. Please try again`);
      await this.openTemplateRepositoryMenu(platform);
    }

    if (data.length === 0) {
      console.log('Sorry there exist no template repository. Please add one!');
      await this.openTemplateRepositoryMenu(platform);
    }

    const tempalteRepos = await util.inquirer.prompt([
      {
        type: 'select',
        name: 'tempalteRepo',
        message: 'Select a Template Repo:',
        choices: data.map((templateRepo: { name: string }) => templateRepo.name),
      },
    ]);

    const repoName = tempalteRepos['tempalteRepo'];

    await util.inquirer
      .prompt(
        iP.actionMenu([
          {
            name: 'Do you want to create a new File?',
            value: () => this.createNewFileForTR(platform, repoName),
          },
          {
            name: 'Edit a existing File',
            value: () => this.listAllFilesAndEdit(platform, repoName),
          },
        ]),
      )
      .then((answer) => answer['action']());
  }

  private async listAllFilesAndEdit(platform: IPlatform, repoName: string) {
    console.log();
    try {
      const res = await this.hubService.listAllContestOfRepo(platform, repoName);

      await util.inquirer
        .prompt([
          {
            type: 'select',
            name: 'file',
            message: 'Please select a file:',
            choices: res.map((trFile: { path: string; sha: string }) => ({
              name: trFile.path,
              value: trFile,
            })),
          },
        ])
        .then(async (answer) => {
          await this.editFile(platform, repoName, answer.file.path, answer.file.sha);
        });
    } catch (error) {
      console.log('Sorry it seems like there is no existing file - please add one');
      await this.util.wait(2000);
      await this.openTemplateRepositoryMenu(platform);
    }
  }

  private async editFile(platform: IPlatform, repoName: string, path: string, sha: string) {
    const currentContent = await this.hubService.getFileContent(platform, repoName, path);
    const { message, content } = await this.askMessageAndContent(currentContent);

    try {
      await this.hubService.updateFileContent(platform, repoName, path, message, content, sha);
      console.log(`The content was sucessfully changed`);

      await this.util.askReturnOrExit(
        () => this.openTemplateRepositoryMenu(platform),
        'Template Repository Menu',
      );
    } catch (error) {
      console.log(error);
    }
  }

  private async createNewFileForTR(platform: IPlatform, repoName: string) {
    const resPath = await util.inquirer.prompt(iP.enterPathOfFile);
    const path = resPath['enterPathOfFile'].trim();

    if (path === '') {
      console.log('Sorry the path cant be empty - please try again!');
      await this.util.wait(2000);
      await this.openTemplateRepositoryMenu(platform);
      return;
    }

    const { message, content } = await this.askMessageAndContent();

    try {
      await this.hubService.updateFileContent(platform, repoName, path, message, content);
      console.log(`The file ${path} was successfully created`);
    } catch (error) {
      console.log('Sorry there was a error please try again');
    }

    await this.util.askReturnOrExit(
      () => this.openTemplateRepositoryMenu(platform),
      'Template Repository Menu',
    );
  }

  private async askMessageAndContent(currentContent = '') {
    const res2 = await util.inquirer.prompt(iP.enterContentOfFile(currentContent));
    const res1 = await util.inquirer.prompt(iP.enterMessageOfFile);

    const message: string = res1['enterMessageOfFile'];
    const content = Buffer.from(res2['enterContentOfFile'], 'utf-8').toString('base64');

    return { message, content };
  }
}

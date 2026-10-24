#!/usr/bin/env node
import * as util from '../utils/utils.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import type { Menu } from '../menus/menu.js';
import { CheckToken } from './checkToken.js';
import * as iP from '../utils/inquirerPrompt.js';

export class Login {
  constructor(
    private readonly hubService: GitHubService,
    private readonly labService: GitLabService,
    private readonly utils: util.Utils,
    private readonly menu: Menu,
    private readonly checkToken: CheckToken,
  ) {}

  renderFiglet(
    text: string,
    options: Parameters<typeof util.figlet>[1],
    colorFn: (text: string) => string,
  ) {
    return new Promise<void>((resolve) => {
      util.figlet(text, options, (err, data) => {
        if (err || !data) {
          this.utils.logError(err);
          resolve();
          return;
        }

        let tempResult = util.alignText(data, (length) =>
          this.utils.centerText(length, process.stdout.columns || 80),
        );
        let result = colorFn(tempResult);
        console.log(result);
        resolve();
      });
    });
  }

  async startProgram() {
    await this.renderFiglet(
      'Welcome to Meowzerus Classroom',
      { font: 'Small', horizontalLayout: 'fitted', verticalLayout: 'fitted' },
      util.colors.whiteBright,
    );

    await this.renderFiglet(
      'The fun CLI for your Git classroom',
      { font: 'mini', horizontalLayout: 'fitted', verticalLayout: 'fitted' },
      util.colors.red,
    );

    await this.utils.wait(3000);
    console.clear();

    await this.isGitInstalled();
  }

  private async isGitInstalled() {
    try {
      await util.execa`git --version`;
    } catch {
      console.log('Sorry you need Git to run this application. Please install it.');
      console.log('You can find it at: https://git-scm.com/install/');
      util.spinner.fail('Please try again when installed!');
      await this.utils.wait(3000);
      process.exit(1);
    }
    this.continueProcess();
  }

  private continueProcess() {
    util.inquirer
      .prompt(iP.continueQuestion)
      .then(async () => {
        try {
          await this.loginProcess();
        } catch {
          console.log('Something went wrong...');
          util.spinner.fail('Please try again!');
          process.exit(1);
        }
      })
      .catch((error) => {
        this.utils.logError(error);
      });
  }

  private async loginProcess() {
    console.clear();

    util.inquirer
      .prompt(iP.loginQuestion)
      .then(async (answer) => {
        util.spinner.start('Started login process...');
        if (answer['loginOptions'] === 'GitHub') {
          const existingToken = await this.checkToken.doesTokenExist('GitHub');

          if (existingToken) {
            await this.menu.openMainMenu(answer['loginOptions'], existingToken);
            util.spinner.succeed('Login sucessfull');
          } else {
            this.hubService.loginIntoGitHub();
          }
        } else if (answer['loginOptions'] === 'GitLab') {
          const existingToken = await this.checkToken.doesTokenExist('GitLab');

          if (existingToken) {
            await this.menu.openMainMenu(answer['loginOptions'], existingToken);
            util.spinner.succeed('Login sucessfull');
          } else {
            this.labService.loginIntoGitLab();
          }
        } else {
          console.log('Sorry we only support these two platforms.');
        }
      })
      .catch((error) => {
        this.utils.logError(error);
      });
  }
}

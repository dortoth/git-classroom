#!/usr/bin/env node
import picocolors from 'picocolors';
import inquirer from 'inquirer';
import figlet from 'figlet';
import align_text from 'align-text';
import { spinner } from '../utils/utils.js';
import type { GitHubService } from '../api/github-service.js';
import type { GitLabService } from '../api/gitlab-service.js';
import type { Utils } from '../utils/utils.js';
import type { Menu } from './menu.js';
import { execa } from 'execa';

const continueQuestion = [
  {
    type: 'input',
    name: 'proceed',
    message: 'Would you like to continue with the login? Press enter.',
  },
];

const loginQuestion = [
  {
    type: 'rawlist',
    name: 'loginOptions',
    message: 'With which platform would you like to login?',
    choices: ['GitHub', 'GitLab', 'Nothing'],
  },
];

export class Login {
  constructor(
    private readonly hubService: GitHubService,
    private readonly labService: GitLabService,
    private readonly utils: Utils,
    private readonly menu: Menu,
  ) {}

  renderFiglet(
    text: string,
    options: Parameters<typeof figlet>[1],
    colorFn: (text: string) => string,
  ) {
    return new Promise<void>((resolve) => {
      figlet(text, options, (err, data) => {
        if (err || !data) {
          this.utils.logError(err);
          resolve();
          return;
        }

        let tempResult = align_text(data, (length) =>
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
      picocolors.whiteBright,
    );

    await this.renderFiglet(
      'The fun CLI for your Git classroom',
      { font: 'mini', horizontalLayout: 'fitted', verticalLayout: 'fitted' },
      picocolors.red,
    );

    await this.utils.wait(3000);
    console.clear();

    await this.isGitInstalled();
  }

  private async isGitInstalled() {
    try {
      await execa`git --version`;
    } catch {
      console.log('Sorry you need Git to run this application. Please install it.');
      console.log('You can find it at: https://git-scm.com/install/');
      spinner.fail('Please try again when installed!');
      await this.utils.wait(3000);
      process.exit(1);
    }
    this.continueProcess();
  }

  private continueProcess() {
    inquirer
      .prompt(continueQuestion)
      .then(async () => {
        try {
          await this.loginProcess();
        } catch {
          console.log('Something went wrong...');
          spinner.fail('Please try again!');
          process.exit(1);
        }
      })
      .catch((error) => {
        this.utils.logError(error);
      });
  }

  private async loginProcess() {
    console.clear();

    inquirer
      .prompt(loginQuestion)
      .then(async (answer) => {
        spinner.start('Started login process...');
        if (answer['loginOptions'] === 'GitHub') {
          const existingToken = await this.utils.doesTokenExist('GitHub');

          if (existingToken) {
            await this.menu.openMainMenu(answer['loginOptions'], existingToken);
            spinner.succeed('Login sucessfull');
          } else {
            this.hubService.loginIntoGitHub();
          }
        } else if (answer['loginOptions'] === 'GitLab') {
          const existingToken = await this.utils.doesTokenExist('GitLab');

          if (existingToken) {
            await this.menu.openMainMenu(answer['loginOptions'], existingToken);
            spinner.succeed('Login sucessfull');
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

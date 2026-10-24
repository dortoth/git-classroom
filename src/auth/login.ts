#!/usr/bin/env node
import * as util from '../utils/utils.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import type { Menu } from '../menus/menu.js';
import { TokenManagement } from './tokenManagement.js';
import * as iP from '../utils/inquirerPrompt.js';
import { GITHUB_LOGIN, GITLAB_LOGIN, KEYRING_SERVICE, PLATFORM_LOGINS } from '../config/config.js';
import { Entry } from '@napi-rs/keyring';
import type { ILogin } from '../config/interfaces/ilogin.js';
import type { IPlatform } from '../config/interfaces/iplatform.js';

export class Login {
  constructor(
    private readonly hubService: GitHubService,
    private readonly labService: GitLabService,
    private readonly utils: util.Utils,
    private readonly menu: Menu,
    private readonly tokenManagement: TokenManagement,
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

    try {
      const answer = await util.inquirer.prompt(iP.loginQuestion);
      util.spinner.start('Started login process...');

      const provider = answer['loginOptions'];
      const platformLogins = PLATFORM_LOGINS[provider];

      if (!platformLogins) {
        console.log('Sorry we only support these two platforms.');
        return;
      }

      const existingToken = await this.tokenManagement.doesTokenExist(platformLogins);

      if (existingToken) {
        await this.menu.openMainMenu(existingToken);
        util.spinner.succeed('Login successful');
      } else {
        await this.loginGitHubOrLab(platformLogins);
      }
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async loginGitHubOrLab(platformLogins: ILogin) {
    let token = '';
    let platfromMenu: IPlatform;
    try {
      if (platformLogins === GITHUB_LOGIN) {
        const data = await this.hubService.githubLoginApi();
        const userCode = data.user_code;
        const deviceCode = data.device_code;
        const expiresIn = data.expires_in;
        util.spinner.info();
        console.log(
          'Please go to  https://github.com/login/device and enter your Code ' + userCode,
        );

        token = await this.tokenManagement.pollForToken(platformLogins, deviceCode, expiresIn);

        platfromMenu = {
          provider: 'GitHub',
          token: token,
        };
        new Entry(KEYRING_SERVICE, 'github_token').setPassword(token);
      } else {
        const data = await this.labService.gitlabLoginApi();
        const deviceCode = data.device_code;
        const userCode = data.user_code;
        const verificationUri = data.verification_uri;
        const expiresIn = data.expires_in;

        util.spinner.info();
        console.log('Please go to ' + verificationUri + ' and enter your Code ' + userCode);

        token = await this.tokenManagement.pollForToken(platformLogins, deviceCode, expiresIn);
        new Entry(KEYRING_SERVICE, 'gitlab_token').setPassword(token);

        platfromMenu = {
          provider: 'GitLab',
          token: token,
        };
      }

      util.spinner.start('Menu is loading...');
      try {
        util.spinner.succeed('Login successful.');
        await this.menu.openMainMenu(platfromMenu);
      } catch {
        console.log('Something went wrong...');
        util.spinner.fail('Please try again!');
        process.exit(1);
      }
    } catch (error) {
      this.utils.logError(error);
    }
  }
}

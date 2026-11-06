import type { IPlatform } from '../config/interfaces/platform.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import * as iP from '../utils/inquirer-prompts.js';
import * as util from '../utils/utils.js';
import { axios } from '../utils/utils.js';
import type { MainMenu } from './main-menu.js';

export class ManageMembersMenu {
  private menu!: MainMenu;

  constructor(
    private readonly hubService: GitHubService,
    private readonly labService: GitLabService,
    private readonly utils: util.Utils,
  ) {}

  setMainMenu(menu: MainMenu) {
    this.menu = menu;
  }

  async manageMembers(platform: IPlatform) {
    await util.inquirer.prompt(iP.manageMembersOptions).then(async (answer) => {
      if (answer['manageMembersOptions'] == 'lom') {
        await this.listTeamMembers(platform);
      } else if (answer['manageMembersOptions'] == 'coi') {
        await this.createAnTeamInivtation(platform);
      } else if (answer['manageMembersOptions'] == 'rom') {
        await this.removeTeamMemeber(platform);
      } else {
        await this.menu.openMainMenu(platform);
      }
    });

    await util.inquirer.prompt(iP.returnToMainMenu).then((answer) => {
      if (answer['proceed'] === true) {
        this.menu.openTeamMenu(platform);
      } else {
        console.log('The program will be terminated now.');
        process.exit(0);
      }
    });
  }

  private async listTeamMembers(platform: IPlatform) {
    try {
      const [member, admin] = await this.hubService.listOrgaMembers(platform);
      console.clear();
      const table = new util.Table();
      table.addColumn('Username');
      table.addColumn('Role');
      member.forEach((member) => table.addRow([member.name, member.role]));
      admin.forEach((admin) => table.addRow([admin.name, admin.role]));
      console.log(table.render());
      console.log('\n');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? `${error.response?.status} ${error.response?.statusText}`
        : error;
      this.utils.logError(message);
      await this.utils.wait(3000);
      console.clear();
      return this.menu.openTeamMenu(platform);
    }
  }

  private async createAnTeamInivtation(platform: IPlatform) {
    console.clear();
    const { role } = await util.inquirer.prompt(iP.enterRole(platform.provider));

    if (role === 'back') {
      this.menu.openTeamMenu(platform);
      return;
    }

    const emailAnswer = await util.inquirer.prompt(iP.enterEmailOfNewUser);
    const emails = emailAnswer['email'].split(',').map((e: string) => e.trim());

    for (const email of emails) {
      try {
        await this.hubService.createNewInvitation(platform, email, role);
        console.log(`Invitation sent to ${email}.`);
      } catch (error) {
        console.log(`Invitation for ${email} failed.`);
      }
    }
  }

  private async removeTeamMemeber(platform: IPlatform) {
    console.clear();
    const userAnswer = await util.inquirer.prompt(iP.usernameOfDeletedUser);
    const usernames = userAnswer['username'].split(',').map((u: string) => u.trim());

    for (const username of usernames) {
      try {
        await this.hubService.removeUserFromOrg(platform, username);
        console.log(`${username} was removed.`);
      } catch (error) {
        console.log(`Removing ${username} failed.`);
      }
    }
  }
}

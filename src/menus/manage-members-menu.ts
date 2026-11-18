import type { IPlatform } from '../config/interfaces/platform.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import * as iP from '../utils/inquirer-prompts.js';
import * as util from '../utils/utils.js';
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
    await util.inquirer
      .prompt(
        iP.actionMenu([
          { name: 'List classroom members', value: () => this.listClassroomMembers(platform) },
          {
            name: 'Create a classroom invitation',
            value: () => this.createClassroomInvitation(platform),
          },
          { name: 'Remove a classroom member', value: () => this.removeClassroomMember(platform) },
          { name: 'Return to Main Menu', value: () => this.menu.openClassroomMenu(platform) },
        ]),
      )
      .then((answer) => answer['action']());
  }

  private async returnOrExit(platform: IPlatform) {
    await this.utils.askReturnOrExit(() => this.manageMembers(platform), 'Manage Members Menu');
  }

  private async listClassroomMembers(platform: IPlatform) {
    try {
      const [member, admin] = await this.hubService.listOrgaMembers(platform);
      console.clear();
      const table = new util.Table();
      table.addColumn('Username');
      table.addColumn('Role');
      member.forEach((m) => table.addRow([m.name, 'Student']));
      admin.forEach((a) => table.addRow([a.name, 'Teacher']));
      console.log(table.render());
      console.log('\n');
    } catch (error) {
      this.utils.logError(error);
      await this.utils.wait(3000);
      console.clear();
      return this.menu.openClassroomMenu(platform);
    }
    await this.returnOrExit(platform);
  }

  private async createClassroomInvitation(platform: IPlatform) {
    console.clear();
    const { role } = await util.inquirer.prompt(iP.enterRole(platform.provider));

    if (role === 'back') {
      await this.menu.openClassroomMenu(platform);
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
    await this.returnOrExit(platform);
  }

  private async removeClassroomMember(platform: IPlatform) {
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
    await this.returnOrExit(platform);
  }
}

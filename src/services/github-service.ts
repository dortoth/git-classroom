import * as util from '../utils/utils.js';
import * as iP from '../utils/inquirerPrompt.js';
import type { Menu } from '../menus/menu.js';
import { Entry } from '@napi-rs/keyring';
import { CLIENT_ID_GITHUB, KEYRING_SERVICE } from '../config/config.js';

export class GitHubService {
  constructor(
    private readonly menu: Menu,
    private readonly utils: util.Utils,
  ) {}

  private async requestGitHubToken(deviceCode: string) {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID_GITHUB,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    return response.json();
  }

  async pollForGitHubToken(deviceCode: string, expiresIn: number) {
    const deadline = Date.now() + expiresIn * 1000;
    while (true) {
      if (Date.now() > deadline) {
        throw new Error('It seems like the session expired. Please try again');
      }

      await this.utils.wait(5000);

      const data = await this.requestGitHubToken(deviceCode);

      if (data.error === 'authorization_pending') {
        continue;
      } else if (data.access_token) {
        return data.access_token;
      } else {
        throw new Error(data.error);
      }
    }
  }

  async gitHubLoginApi() {
    const res = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ client_id: CLIENT_ID_GITHUB, scope: 'admin:org' }),
    });
    return await res.json();
  }

  // ----------- GitHub Menu ------------------
  async loadExisitingGitHubOrganization(token: string) {
    let res: Response;
    try {
      res = await fetch('https://api.github.com/user/orgs', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
      });
    } catch {
      console.log('Network error. Please check your internet connection.');
      process.exit(1);
    }
    if (!res.ok) {
      console.log('Something went wrong...');
      process.exit(1);
    }
    const data = await res.json();

    if (data.length === 0) {
      console.log('Sorry there exist no organization. Please add one!');
      process.exit(1);
    } else {
      console.clear();
      await util.inquirer
        .prompt([
          {
            type: 'select',
            name: 'organization',
            message: 'Select a GitHub organization:',
            choices: data.map((org: { login: string }) => org.login),
          },
        ])
        .then(async (answer) => {
          await this.menu.openGitHubOrganizationMenu(token, answer.organization);
        });
    }
  }

  // Create an organization invitation ->  dort kann man eine role mitgeben dh.
  // man zuerst einen Dialog machen ob der User ein Admin sein sollte oder nicht dann die jeweilige Rolle mitschicken
  //und es geht nur für eine Person
  // Remove an organization member
  async manageMembers(orgToken: string, orgName: string) {
    await util.inquirer.prompt(iP.manageMembersOptions).then(async (answer) => {
      if (answer['manageMembersOptions'] == 'lom') {
        await this.listOrgaMembers(orgToken, orgName);
      } else if (answer['manageMembersOptions'] == 'coi') {
      } else {
      }
    });
  }

  private async listOrgaMembers(orgToken: string, orgName: string) {
    let responseOrgaList: Response;
    try {
      responseOrgaList = await fetch(
        `https://api.github.com/orgs/${orgName}/members?per_page=100`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${orgToken}`,
            Accept: 'application/vnd.github+json',
          },
        },
      );
    } catch {
      console.log('Network error. Please check your internet connection.');
      await this.utils.wait(3000);
      return await this.menu.openGitHubOrganizationMenu(orgToken, orgName);
    }

    if (!responseOrgaList.ok) {
      await this.utils.logError(`${responseOrgaList.status} ${responseOrgaList.statusText}`);
      await this.utils.wait(3000);
      return await this.menu.openGitHubOrganizationMenu(orgToken, orgName);
    }
    const dataOrgaList: { login: string }[] = await responseOrgaList.json();

    console.clear();
    console.table(dataOrgaList.map((member) => ({ Username: member.login })));
    console.log('\n\n');

    await util.inquirer.prompt(iP.returnToMainMenu).then((answer) => {
      if (answer['loadOrg'] === true) {
        this.menu.openGitHubOrganizationMenu(orgToken, orgName);
      } else {
        console.log('The program will be terminated now.');
        process.exit(0);
      }
    });
  }

  async createClassroom() {}
  async createTemplateRepository() {}
  async createAssignment() {}
}

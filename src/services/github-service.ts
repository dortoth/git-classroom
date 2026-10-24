import axios from 'axios';
import { CLIENT_ID_GITHUB } from '../config/config.js';
import type { IPlatform } from '../config/interfaces/iplatform.js';

export class GitHubService {
  async requestGitHubToken(deviceCode: string) {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID_GITHUB,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      },
      {
        headers: { Accept: 'application/json' },
        validateStatus: () => true,
      },
    );

    return response.data;
  }

  async githubLoginApi() {
    const res = await axios.post(
      'https://github.com/login/device/code',
      { client_id: CLIENT_ID_GITHUB, scope: 'admin:org' },
      { headers: { Accept: 'application/json' } },
    );
    return res.data;
  }

  // ----------- GitHub Menu ------------------

  async loadGithubOrganization(token: string) {
    try {
      const res = await axios.get('https://api.github.com/user/orgs', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });
      return res.data;
    } catch {
      console.log('Something went wrong...');
      process.exit(1);
    }
  }

  // Create an organization invitation ->  dort kann man eine role mitgeben dh.
  // man zuerst einen Dialog machen ob der User ein Admin sein sollte oder nicht dann die jeweilige Rolle mitschicken
  //und es geht nur für eine Person
  // Remove an organization member
  async listOrgaMembers(platform: IPlatform): Promise<{ login: string }[]> {
    const res = await axios.get(`https://api.github.com/orgs/${platform.teamsUrl}/members`, {
      params: { per_page: 100 },
      headers: {
        Authorization: `Bearer ${platform.token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    return res.data;
  }
}

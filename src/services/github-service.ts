import axios from 'axios';
import { CLIENT_ID_GITHUB } from '../config/config.js';
import type { IPlatform } from '../config/interfaces/platform.js';

const gitHubApiUrl = 'https://api.github.com';
const githubLogin = 'https://github.com/login';

export class GitHubService {
  async requestGitHubToken(deviceCode: string) {
    const response = await axios.post(
      `${githubLogin}/oauth/access_token`,
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
      `${githubLogin}/device/code`,
      { client_id: CLIENT_ID_GITHUB, scope: 'admin:org' },
      { headers: { Accept: 'application/json' } },
    );
    return res.data;
  }

  // ----------- GitHub Menu ------------------

  async loadGithubOrganization(token: string) {
    try {
      const res = await axios.get(`${gitHubApiUrl}/user/orgs`, {
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

  private async getRoleOfMemebers(
    platform: IPlatform,
    role: 'member' | 'admin',
  ): Promise<{ name: string; role: string }[]> {
    const res = await axios.get<{ login: string }[]>(
      `${gitHubApiUrl}/orgs/${platform.teamsUrl}/members`,
      {
        params: { per_page: 100, role },
        headers: {
          Authorization: `Bearer ${platform.token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    return res.data.map((m) => ({ name: m.login, role }));
  }

  async listOrgaMembers(platform: IPlatform) {
    return Promise.all([
      this.getRoleOfMemebers(platform, 'member'),
      this.getRoleOfMemebers(platform, 'admin'),
    ]);
  }

  async createNewInvitation(platform: IPlatform, email: string, role: string): Promise<boolean> {
    const res = await axios.post(
      `${gitHubApiUrl}/orgs/${platform.teamsUrl}/invitations`,
      { email, role },
      {
        headers: {
          Authorization: `Bearer ${platform.token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    return res.status === 201;
  }

  async removeUserFromOrg(platform: IPlatform, username: string): Promise<boolean> {
    const res = await axios.delete(
      `${gitHubApiUrl}/orgs/${platform.teamsUrl}/memberships/${username}`,
      {
        headers: {
          Authorization: `Bearer ${platform.token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    return res.status === 204;
  }
}

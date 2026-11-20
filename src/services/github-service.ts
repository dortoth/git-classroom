import axios, { type AxiosInstance } from 'axios';
import { GITHUB_API_URL, GITHUB_LOGIN } from '../config/config.js';
import type { IPlatform } from '../config/interfaces/platform.js';
import { platform } from 'node:os';

export class GitHubService {
  private api(token: string): AxiosInstance {
    return axios.create({
      baseURL: GITHUB_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });
  }

  // ----------- GitHub Login ------------------

  async requestGitHubToken(deviceCode: string) {
    const response = await axios.post(
      GITHUB_LOGIN.tokenUrl,
      {
        client_id: GITHUB_LOGIN.clientId,
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
      GITHUB_LOGIN.deviceCodeUrl,
      { client_id: GITHUB_LOGIN.clientId, scope: 'admin:org repo' },
      { headers: { Accept: 'application/json' } },
    );
    return res.data;
  }

  // ----------- GitHub Menu ------------------

  async loadGithubOrganization(token: string) {
    const res = await this.api(token).get('/user/orgs');
    return res.data;
  }

  private async getMembersByRole(
    platform: IPlatform,
    role: 'member' | 'admin',
  ): Promise<{ name: string; role: string }[]> {
    const res = await this.api(platform.token).get<{ login: string }[]>(
      `/orgs/${platform.classroomUrl}/members`,
      { params: { per_page: 100, role } },
    );

    return res.data.map((m) => ({ name: m.login, role }));
  }

  async listOrgaMembers(platform: IPlatform) {
    return Promise.all([
      this.getMembersByRole(platform, 'member'),
      this.getMembersByRole(platform, 'admin'),
    ]);
  }

  async createNewInvitation(platform: IPlatform, email: string, role: string) {
    await this.api(platform.token).post(`/orgs/${platform.classroomUrl}/invitations`, {
      email,
      role,
    });
  }

  async removeUserFromOrg(platform: IPlatform, username: string) {
    await this.api(platform.token).delete(`/orgs/${platform.classroomUrl}/memberships/${username}`);
  }

  //Template Repository Menu

  async createTemplateRepository(platform: IPlatform, repoName: string, isTemplate: boolean) {
    const res = await this.api(platform.token).post(`/orgs/${platform.classroomUrl}/repos`, {
      name: repoName,
      is_template: true,
      auto_init: isTemplate,
    });
    return res.data;
  }

  async loadAllTemplateRepos(platform: IPlatform) {
    const res = await this.api(platform.token).get(`/orgs/${platform.classroomUrl}/repos`);
    return res.data;
  }

  private contentsUrl(platform: IPlatform, repoName: string, path = '') {
    const cleanPath = path.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
    return `/repos/${platform.classroomUrl}/${repoName}/contents/${cleanPath}`;
  }

  async listAllContestOfRepo(platform: IPlatform, repoName: string, path = '') {
    const res = await this.api(platform.token).get(this.contentsUrl(platform, repoName, path));
    return res.data;
  }

  async getFileContent(platform: IPlatform, repoName: string, path: string): Promise<string> {
    const res = await this.api(platform.token).get(this.contentsUrl(platform, repoName, path));
    return Buffer.from(res.data.content ?? '', 'base64').toString('utf-8');
  }

  async updateFileContent(
    platform: IPlatform,
    repoName: string,
    path: string,
    message: string,
    content: string,
    sha?: string,
  ) {
    await this.api(platform.token).put(this.contentsUrl(platform, repoName, path), {
      message: message,
      content: content,
      sha: sha,
    });
  }
}

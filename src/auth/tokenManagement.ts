import { Entry } from '@napi-rs/keyring';
import axios from 'axios';
import { GITHUB_LOGIN, GITLAB_LOGIN, KEYRING_SERVICE } from '../config/config.js';
import type { ILogin } from '../config/interfaces/ilogin.js';
import type { GitHubService } from '../services/github-service.js';
import type { GitLabService } from '../services/gitlab-service.js';
import * as util from '../utils/utils.js';
import type { IPlatform } from '../config/interfaces/iplatform.js';

export class TokenManagement {
  constructor(
    private readonly hubService: GitHubService,
    private readonly labService: GitLabService,
    private readonly utils: util.Utils,
  ) {}

  private readToken(account: string) {
    try {
      return new Entry(KEYRING_SERVICE, account).getPassword();
    } catch {
      return null;
    }
  }

  async doesTokenExist(platformLogins: ILogin) {
    let platfromMenu: IPlatform;
    if (platformLogins === GITHUB_LOGIN) {
      const token = this.readToken('github_token');
      if (!token) return null;

      const response = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });

      if (response.status !== 200) return null;

      platfromMenu = {
        provider: 'GitHub',
        token: token,
      };

      return platfromMenu;
    } else if (platformLogins === GITLAB_LOGIN) {
      const token = this.readToken('gitlab_token');
      if (!token) return null;

      const response = await axios.get('https://gitlab.com/api/v4/user', {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });

      if (response.status !== 200) return null;

      platfromMenu = {
        provider: 'GitLab',
        token: token,
      };
      return platfromMenu;
    }

    return null;
  }

  async pollForToken(platformLogins: ILogin, deviceCode: string, expiresIn: number) {
    const deadline = Date.now() + expiresIn * 1000;
    while (true) {
      if (Date.now() > deadline) {
        throw new Error('It seems like the session expired. Please try again');
      }

      await this.utils.wait(5000);
      let data = null;
      if (platformLogins === GITHUB_LOGIN) {
        data = await this.hubService.requestGitHubToken(deviceCode);
      } else {
        data = await this.labService.requestGitLabToken(deviceCode);
      }

      if (data.error === 'authorization_pending') {
        continue;
      } else if (data.access_token) {
        return data.access_token;
      } else {
        throw new Error(data.error);
      }
    }
  }
}

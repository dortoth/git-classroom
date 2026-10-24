import { Entry } from '@napi-rs/keyring';
import { KEYRING_SERVICE } from '../config/config.js';

export class CheckToken {
  private readToken(account: string) {
    try {
      return new Entry(KEYRING_SERVICE, account).getPassword();
    } catch {
      return null;
    }
  }

  async doesTokenExist(platform: string) {
    if (platform === 'GitHub') {
      const token = this.readToken('github_token');
      if (!token) return null;

      const response = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.status === 200 ? token : null;
    } else if (platform === 'GitLab') {
      const token = this.readToken('gitlab_token');
      if (!token) return null;

      const response = await fetch('https://gitlab.com/api/v4/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.status === 200 ? token : null;
    }

    return null;
  }
}

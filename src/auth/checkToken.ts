import { Entry } from '@napi-rs/keyring';
import { GITHUB_LOGIN, GITLAB_LOGIN, KEYRING_SERVICE } from '../config/config.js';
import type { ILogin } from '../config/interfaces/ilogin.js';

export class CheckToken {
  private readToken(account: string) {
    try {
      return new Entry(KEYRING_SERVICE, account).getPassword();
    } catch {
      return null;
    }
  }

  async doesTokenExist(login: ILogin) {
    if (login === GITHUB_LOGIN) {
      const token = this.readToken('github_token');
      if (!token) return null;

      const response = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.status === 200 ? token : null;
    } else if (login === GITLAB_LOGIN) {
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

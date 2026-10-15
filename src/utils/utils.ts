import ora from 'ora';
import { Entry } from '@napi-rs/keyring';
import { KEYRING_SERVICE } from './config.js';

export const spinner = ora();

export class Utils {
  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  centerText(length: number, terminalWidth: number) {
    return Math.max(0, Math.floor((terminalWidth - length) / 2));
  }

  logError(error: any) {
    console.log('Something went wrong...');
    console.log('Please try again!');
    console.log(error);
  }

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

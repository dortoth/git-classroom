import type { Utils } from '../utils/utils.js';
import { spinner } from '../utils/utils.js';
import type { Menu } from '../menus/menu.js';
import { Entry } from '@napi-rs/keyring';
import { CLIENT_ID_GITLAB, KEYRING_SERVICE } from '../config/config.js';

export class GitLabService {
  constructor(
    private readonly menu: Menu,
    private readonly utils: Utils,
  ) {}

  //-------------- GitLab Login --------------------
  private async requestGitLabToken(deviceCode: string) {
    const response = await fetch('https://gitlab.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID_GITLAB,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    return response.json();
  }

  async pollForGitLabToken(deviceCode: string, expiresIn: number) {
    const deadline = Date.now() + expiresIn * 1000;

    while (true) {
      if (Date.now() > deadline) {
        throw new Error('It seems like the session expired. Please try again');
      }

      await this.utils.wait(5000);

      const data = await this.requestGitLabToken(deviceCode);

      if (data.error === 'authorization_pending') {
        continue;
      } else if (data.access_token) {
        return data.access_token;
      } else {
        throw new Error(data.error);
      }
    }
  }

  async loginIntoGitLab() {
    try {
      const res = await fetch('https://gitlab.com/oauth/authorize_device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ client_id: CLIENT_ID_GITLAB }),
      });
      const data = await res.json();

      const deviceCode = data.device_code;
      const userCode = data.user_code;
      const verificationUri = data.verification_uri;
      const expiresIn = data.expires_in;

      spinner.info();
      console.log('Please go to ' + verificationUri + ' and enter your Code ' + userCode);

      const labToken = await this.pollForGitLabToken(deviceCode, expiresIn);
      new Entry(KEYRING_SERVICE, 'gitlab_token').setPassword(labToken);
      spinner.start('Menu is loading...');

      try {
        spinner.succeed('Login successful.');
        await this.menu.openMainMenu('GitLab', labToken);
      } catch {
        console.log('Something went wrong...');
        spinner.fail('Please try again!');
        process.exit(1);
      }
    } catch (error) {
      this.utils.logError(error);
    }
  }

  // ----------- GitLab Menu ------------------
  async loadExisitingGitLabGroup() {
    //TODO
  }
}

import type { Utils } from '../utils/utils.js';
import ora from 'ora';
import dotenv from 'dotenv';
import type { Menu } from '../main/menu.js';
import { Entry } from '@napi-rs/keyring';
import { CLIENT_ID_GITLAB, KEYRING_SERVICE } from '../utils/config.js';

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
    fetch('https://gitlab.com/oauth/authorize_device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ client_id: CLIENT_ID_GITLAB }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        const deviceCode = data.device_code;
        const userCode = data.user_code;
        const verificationUri = data.verification_uri;
        const expiresIn = data.expires_in;

        console.log('Please go to ' + verificationUri + ' and enter your Code ' + userCode);

        const labToken = await this.pollForGitLabToken(deviceCode, expiresIn);
        new Entry(KEYRING_SERVICE, 'gitlab_token').setPassword(labToken);
        const spinner = ora('Menu is loading...').start();

        try {
          await this.menu.openMainMenu('GitLab', labToken);
          spinner.succeed('Login successful.');
        } catch {
          console.log('Something went wrong...');
          spinner.fail('Please try again!');
          process.exit(1);
        }
      })
      .catch((error) => this.utils.logError(error));
  }

  // ----------- GitLab Menu ------------------
  async loadExisitingGitLabGroup() {
    //TODO
  }
}

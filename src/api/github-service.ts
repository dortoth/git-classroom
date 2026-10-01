import { wait, logError } from '../utils/utils.js';
import ora from 'ora';
import { openMainMenu } from '../main/menu.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './secure/.env' });
const clientIdGitHub = process.env['CLIENT_ID_GITHUB'];
const TOKEN_PATH = './secure/token.json';

export class GitHubService {
  async pollForGitHubToken(deviceCode: string, expiresIn: number) {
    const deadline = Date.now() + expiresIn * 1000;
    while (true) {
      if (Date.now() > deadline) {
        throw new Error('It seems like the session expired. Please try again');
      }

      await wait(5000);

      const response = await fetch(`https://github.com/login/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientIdGitHub,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      const data = await response.json();

      if (data.error === 'authorization_pending') {
        continue;
      } else if (data.access_token) {
        return data.access_token;
      } else {
        throw new Error(data.error);
      }
    }
  }

  async loginIntoGitHub() {
    fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ client_id: clientIdGitHub }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        const userCode = data.user_code;
        const deviceCode = data.device_code;
        const expiresIn = data.expires_in;
        console.log(
          'Please go to  https://github.com/login/device and enter your Code ' + userCode,
        );

        const hubToken = await this.pollForGitHubToken(deviceCode, expiresIn);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify({ github_token: hubToken }));

        const spinner = ora('Menu is loading...').start();

        try {
          await openMainMenu('github', hubToken);
          spinner.succeed('Login successful.');
        } catch {
          console.log('Something went wrong...');
          spinner.fail('Please try again!');
          process.exit(1);
        }
      })
      .catch((error) => logError(error));
  }
}

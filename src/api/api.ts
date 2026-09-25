import fs from 'fs';
import dotenv from 'dotenv';
import { wait, logError } from '../utils/utils.js';
import ora from 'ora';
import { openMainMenu } from '../main/menu.js';


dotenv.config({ path: './secure/.env' });
const clientIdGitHub = process.env['CLIENT_ID_GITHUB'];
const clientIdGitLab = process.env['CLIENT_ID_GITLAB'];
const TOKEN_PATH = './secure/token.json';

export async function doesTokenExist(platform: string) {
  let tokenData;

  try {
    const rawData = fs.readFileSync(TOKEN_PATH, 'utf8');
    tokenData = JSON.parse(rawData);
  } catch {
    return null;
  }

  if (platform === 'GitHub') {
    const token = tokenData.github_token;
    if (!token) return null;

    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.status === 200 ? token : null;
  } else if (platform === 'GitLab') {
    const token = tokenData.gitlab_token;
    if (!token) return null;

    const response = await fetch('https://gitlab.com/api/v4/user', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.status === 200 ? token : null;
  }

  return null;
}

export async function pollForGitHubToken(deviceCode: string, expiresIn: number) {
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

export async function loginIntoGitHub() {
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
      console.log('Please go to  https://github.com/login/device and enter your Code ' + userCode);

      const hubToken = await pollForGitHubToken(deviceCode, expiresIn);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify({ github_token: hubToken }));

      const spinner = ora('Menu is loading...').start();

      try {
        await openMainMenu('github', hubToken);
        console.log('Login successful.');
        spinner.succeed('Successfully loaded');
      } catch {
        console.log('Something went wrong...');
        spinner.fail('Please try again!');
        process.exit(1);
      }
    })
    .catch((error) => logError(error));
}

export async function pollForGitLabToken(deviceCode: string, expiresIn: number) {
  const deadline = Date.now() + expiresIn * 1000;
  while (true) {
    if (Date.now() > deadline) {
      throw new Error('It seems like the session expired. Please try again');
    }

    await wait(5000);

    const response = await fetch(`https://gitlab.com/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientIdGitLab,
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

export async function loginIntoGitLab() {
  fetch('https://gitlab.com/oauth/authorize_device', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ client_id: clientIdGitLab }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      const deviceCode = data.device_code;
      const userCode = data.user_code;
      const verificationUri = data.verification_uri;
      const expiresIn = data.expires_in;

      console.log('Please go to ' + verificationUri + ' and enter your Code ' + userCode);

      const labToken = await pollForGitLabToken(deviceCode, expiresIn);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify({ gitlab_token: labToken }));

      const spinner = ora('Menu is loading...').start();

      try {
        await openMainMenu('gitlab', labToken);
        console.log('Login successful.');
        spinner.succeed('Successfully loaded');
      } catch {
        console.log('Something went wrong...');
        spinner.fail('Please try again!');
        process.exit(1);
      }
    })
    .catch((error) => logError(error));
}
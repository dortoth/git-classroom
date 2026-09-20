#!/usr/bin/env node
import picocolors from 'picocolors';
import inquirer from 'inquirer';
import figlet from 'figlet';
import align_text from 'align-text';
import ora from 'ora';
import { openMainMenu } from './menu.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: './secure/.env' });

const clientIdGitHub = process.env.CLIENT_ID_GITHUB;
const clientIdGitLab = process.env.CLIENT_ID_GITLAB;
const TOKEN_PATH = './secure/token.json';

const continueQuestion = [
  {
    type: 'input',
    name: 'proceed',
    message: 'Would you like to continue with the login? Press any key.',
  },
];

const loginQuestion = [
  {
    type: 'rawlist',
    name: 'loginOptions',
    message: 'With which platform would you like to login?',
    choices: ['GitHub', 'GitLab', 'Nothing'],
  },
];

const gitQuestion = [
  {
    type: 'confirm',
    name: 'gitQuestion',
    message: 'Do you have Git installed?',
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function centerText(length, terminalWidth) {
  return Math.max(0, Math.floor((terminalWidth - length) / 2));
}

function logError(error) {
  console.log('Something went wrong...');
  console.log('Please try again!');
  console.log(error);
}

function renderFiglet(text, options, colorFn) {
  return new Promise((resolve) => {
    figlet(text, options, (err, data) => {
      if (err) {
        logError(err);
        resolve();
        return;
      }

      let tempResult = align_text(data, (length) => centerText(length, process.stdout.columns || 80));
      let result = colorFn(tempResult);
      console.log(result);
      resolve();
    });
  });
}

export async function startProgram() {
  await renderFiglet(
    'Welcome to Meowzerus Classroom',
    { font: 'Small', horizontalLayout: 'fitted', verticalLayout: 'fitted' },
    picocolors.whiteBright,
  );

  await renderFiglet(
    'The fun CLI for your Git classroom',
    { font: 'mini', horizontalLayout: 'fitted', verticalLayout: 'fitted' },
    picocolors.red,
  );

  await wait(3000);
  console.clear();

  isGitInstalled();
}

function isGitInstalled() {
  inquirer
    .prompt(gitQuestion)
    .then(async (answer) => {
      if (answer.gitQuestion !== true) {
        console.log('Sorry you need Git to run this application. Please install it.');
        console.log('You can find it at: https://git-scm.com/install/');
        await wait(2000);
        process.exit(1);
      }
      continueProcess();
    })
    .catch((error) => {
      logError(error);
    });
}

function continueProcess() {
  inquirer
    .prompt(continueQuestion)
    .then(async () => {
      const spinner = ora('Login is loading...').start();

      try {
        await loginProcess();
        spinner.succeed('Successfully loaded');
      } catch {
        console.log('Something went wrong...');
        spinner.fail('Please try again!');
        process.exit(1);
      }
    })
    .catch((error) => {
      logError(error);
    });
}

export async function loginProcess() {
  await wait(3000);

  console.clear();

  inquirer
    .prompt(loginQuestion)
    .then(async (answer) => {
      if (answer.loginOptions === 'GitHub') {
        const existingToken = await doesTokenExist('GitHub');

        if (existingToken) {
          await openMainMenu(answer.loginOptions, existingToken);
        } else {
          loginIntoGitHub();
        }
      } else if (answer.loginOptions === 'GitLab') {
        const existingToken = await doesTokenExist('GitLab');

        if (existingToken) {
          await openMainMenu(answer.loginOptions, existingToken);
        } else {
          loginIntoGitLab();
        }
      } else {
        console.log('Sorry we only support the other two platforms.');
      }
    })
    .catch((error) => {
      logError(error);
    });
}

async function doesTokenExist(platform) {
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

async function pollForGitHubToken(deviceCode, expiresIn) {
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

async function loginIntoGitHub() {
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

async function pollForGitLabToken(deviceCode, expiresIn) {
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

async function loginIntoGitLab() {
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

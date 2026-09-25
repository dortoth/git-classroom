#!/usr/bin/env node
import picocolors from 'picocolors';
import inquirer from 'inquirer';
import figlet from 'figlet';
import align_text from 'align-text';
import ora from 'ora';
import { openMainMenu } from './menu.js';
import { doesTokenExist, loginIntoGitLab, loginIntoGitHub } from '../api/api.js';
import { centerText, wait, logError } from '../utils/utils.js';


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

function renderFiglet(
  text: string,
  options: Parameters<typeof figlet>[1],
  colorFn: (text: string) => string,
) {
  return new Promise<void>((resolve) => {
    figlet(text, options, (err, data) => {
      if (err || !data) {
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
      if (answer['gitQuestion'] !== true) {
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
      if (answer['loginOptions'] === 'GitHub') {
        const existingToken = await doesTokenExist('GitHub');

        if (existingToken) {
          await openMainMenu(answer['loginOptions'], existingToken);
        } else {
          loginIntoGitHub();
        }
      } else if (answer['loginOptions'] === 'GitLab') {
        const existingToken = await doesTokenExist('GitLab');

        if (existingToken) {
          await openMainMenu(answer['loginOptions'], existingToken);
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




#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import figlet from "figlet";
import align_text from "align-text";
import ora from "ora";
import { openMainMenu } from "./menu.js";
import "dotenv/config";

const clientId = process.env.CLIENT_ID;

const continueQuestion = [
  {
    type: "input",
    name: "proceed",
    message: "Would you like to continue with the login? Press any key.",
  },
];

const loginQuestion = [
  {
    type: "rawlist",
    name: "loginOptions",
    message: "With which platform would you like to login?",
    choices: ["GitHub", "GitLab", "Nothing"],
  },
];

const gitQuestion = [
  {
    type: "confirm",
    name: "gitQuestion",
    message: "Do you have Git installed?",
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function centerText(length, terminalWidth) {
  return Math.max(0, Math.floor((terminalWidth - length) / 2));
}

function logError(error) {
  console.log("Something went wrong...");
  console.log("Please try again!");
  console.log(error);
}

export async function startProgram() {
  await figlet(
    "Welcome to Meowzerus Classroom",
    {
      font: "Small",
      horizontalLayout: "fitted",
      verticalLayout: "fitted",
    },

    function (err, data) {
      if (err) {
        logError(err);
        return;
      }

      let tempResult = align_text(data, (length) =>
        centerText(length, process.stdout.columns || 80),
      );
      let result = chalk.whiteBright(tempResult);
      console.log(result);
    },
  );

  await figlet(
    "The fun CLI for your Git classroom",
    {
      font: "mini",
      horizontalLayout: "fitted",
      verticalLayout: "fitted",
    },
    function (err, data) {
      if (err) {
        logError(err);
        return;
      }

      let tempResult = align_text(data, (length) =>
        centerText(length, process.stdout.columns || 80),
      );
      let result = chalk.red(tempResult);
      console.log(result);
    },
  );

  await wait(3000);
  console.clear();

  isGitInstalled();
}

function isGitInstalled() {
  inquirer
    .prompt(gitQuestion)
    .then((answer) => {
      if(answer.gitQuestion !== true) {
        console.log("Sorry you need Git to run this application. Please install it.");
        console.log("You can find it at: https://git-scm.com/install/");
        wait(2000);
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
      const spinner = ora("Login is loading...").start();

      try {
        await loginProcess();
        spinner.succeed("Successfully loaded");
      } catch {
        console.log("Something went wrong...");
        spinner.fail("Please try again!");
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
      if (answer.loginOptions === "GitHub") {
        loginIntoGitHub();
      } else if (answer.loginOptions === "GitLab") {
        //TODO
        fetch("https://gitlab.example.com/oauth/authorize_device", {
          method: "POST",
        })
          .then((res) => res.json())
          .then(() => {})
          .catch((error) => logError(error));
      } else {
        console.log("Sorry we only support the other two platforms.");
      }
    })
    .catch((error) => {
      logError(error);
    });
}

async function pollForGitHubToke(deviceCode, expiresIn) {
  const deadline = Date.now() + expiresIn * 1000;
  while (true) {
    if (Date.now() > deadline) {
      throw new Error("It seems like the session expired. Please try again");
    }

    await wait(5000);

    const response = await fetch(
      `https://github.com/login/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          device_code: deviceCode,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      },
    );

    const data = await response.json();

    if (data.error === "authorization_pending") {
      continue;
    } else if (data.access_token) {
      return data.access_token;
    } else {
      throw new Error(data.error);
    }
  }
}

async function loginIntoGitHub() {
  fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      const userCode = data.user_code;
      const deviceCode = data.device_code;
      const expiresIn = data.expires_in;
      console.log(
        "Please go to  https://github.com/login/device and enter your Code" +
          userCode,
      );

      const hubToken = await pollForGitHubToke(deviceCode, expiresIn);

      const spinner = ora("Menu is loading...").start();

      try {
        await openMainMenu({
        provider: "github",
        token: hubToken,
      });
        console.log("Login successful.")
        spinner.succeed("Successfully loaded");
      } catch {
        console.log("Something went wrong...");
        spinner.fail("Please try again!");
        process.exit(1);
      }

  
    })
    .catch((error) => logError(error));
}

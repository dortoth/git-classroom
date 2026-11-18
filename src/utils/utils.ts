import axios from 'axios';
import ora from 'ora';
export { default as inquirer } from 'inquirer';
export { default as colors } from 'picocolors';
import { default as cfonts } from 'cfonts';
import inquirer from 'inquirer';
import * as iP from './inquirer-prompts.js';
export { Table } from 'cmd-table';
export { execa } from 'execa';
export { isAxiosError } from 'axios';

export const spinner = ora();

export class Utils {
  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  logError(error: unknown) {
    console.log('Something went wrong...');
    console.log('Please try again!');

    if (axios.isAxiosError(error)) {
      const status = error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message;
      console.log(status);
    } else if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log(String(error));
    }
  }

  async askReturnOrExit(backToMenu: () => unknown, menuName = 'Menu') {
    console.log();
    const answer = await inquirer.prompt(
      iP.actionMenu([
        { name: `Return to ${menuName}`, value: backToMenu },
        { name: 'Exit the application', value: () => this.exitApplication() },
      ]),
    );
    await answer['action']();
  }

  exitApplication() {
    console.log('The application will close now.');
    console.log('Return soon! ~meow');
    process.exit(0);
  }

  renderBanner(text: string, options: Record<string, unknown> = {}) {
    try {
      cfonts.say(text, { align: 'center', ...options });
    } catch (error) {
      this.logError(error);
    }
  }
}

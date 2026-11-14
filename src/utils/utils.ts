import axios from 'axios';
import ora from 'ora';
export { default as inquirer } from 'inquirer';
export { default as colors } from 'picocolors';
import { default as cfonts } from 'cfonts';
export { Table } from 'cmd-table';
export { execa } from 'execa';

export const spinner = ora();

export class Utils {
  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  centerText(length: number, terminalWidth: number) {
    return Math.max(0, Math.floor((terminalWidth - length) / 2));
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

  renderBanner(text: string, options: Record<string, unknown> = {}) {
    try {
      cfonts.say(text, { align: 'center', ...options });
    } catch (error) {
      this.logError(error);
    }
  }
}

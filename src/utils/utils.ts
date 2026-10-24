import ora from 'ora';
export { default as inquirer } from 'inquirer';
export { default as colors } from 'picocolors';
export { default as figlet } from 'figlet';
export { default as alignText } from 'align-text';
export { default as table } from 'cli-table3';
export { default as axios } from 'axios';
export { execa } from 'execa';

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
}

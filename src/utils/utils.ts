export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function centerText(length: number, terminalWidth: number) {
  return Math.max(0, Math.floor((terminalWidth - length) / 2));
}

export function logError(error: any) {
  console.log('Something went wrong...');
  console.log('Please try again!');
  console.log(error);
}
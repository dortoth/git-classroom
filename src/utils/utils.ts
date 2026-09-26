import fs from 'fs';

const TOKEN_PATH = './secure/token.json';

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
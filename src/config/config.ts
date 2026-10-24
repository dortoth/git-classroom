import type { ILogin } from './interfaces/ilogin.js';

export const CLIENT_ID_GITHUB = 'Ov23libzAv2eC0KLbgq3';
export const CLIENT_ID_GITLAB = 'f0df2e565362441b5f032f7a49ccae121b0994d3fb8eab51eb7bd397828e9052';
export const KEYRING_SERVICE = 'git-classroom';

export const GITHUB_LOGIN: ILogin = {
  clientId: CLIENT_ID_GITHUB,
  deviceCodeUrl: 'https://github.com/login/device/code',
  tokenUrl: 'https://github.com/login/oauth/access_token',
};

export const GITLAB_LOGIN: ILogin = {
  clientId: 'CLIENT_ID_GITLAB',
  deviceCodeUrl: 'https://gitlab.com/oauth/authorize_device',
  tokenUrl: 'https://gitlab.com/oauth/token',
};

export const PLATFORM_LOGINS: Record<string, ILogin> = {
  GitHub: GITHUB_LOGIN,
  GitLab: GITLAB_LOGIN,
};

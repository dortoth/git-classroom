#!/usr/bin/env node

import { Login } from './auth/login.js';
import { Menu } from './menus/menu.js';
import { GitHubService } from './services/github-service.js';
import { GitLabService } from './services/gitlab-service.js';
import { Utils } from './utils/utils.js';
import { TokenManagement } from './auth/tokenManagement.js';

const utils = new Utils();
const menu = new Menu(utils);
const hubService = new GitHubService();
const labService = new GitLabService();
menu.setServices(hubService, labService);

const login = new Login(
  hubService,
  labService,
  utils,
  menu,
  new TokenManagement(hubService, labService, utils),
);

login.startProgram();

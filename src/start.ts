#!/usr/bin/env node

import { Login } from './auth/login.js';
import { Menu } from './menus/menu.js';
import { GitHubService } from './services/github-service.js';
import { GitLabService } from './services/gitlab-service.js';
import { Utils } from './utils/utils.js';
import { CheckToken } from './auth/checkToken.js';

const utils = new Utils();
const menu = new Menu(utils);
const hubService = new GitHubService(menu, utils);
const labService = new GitLabService(menu, utils);
menu.setServices(hubService, labService);

const login = new Login(hubService, labService, utils, menu, new CheckToken());

login.startProgram();

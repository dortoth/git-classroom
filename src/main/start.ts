#!/usr/bin/env node

import { Login } from './login.js';
import { Menu } from './menu.js';
import { GitHubService } from '../api/github-service.js';
import { GitLabService } from '../api/gitlab-service.js';
import { Utils } from '../utils/utils.js';

const utils = new Utils();
const menu = new Menu(utils);
const hubService = new GitHubService(menu, utils);
const labService = new GitLabService(menu, utils);
menu.setServices(hubService, labService);

const login = new Login(hubService, labService, utils, menu);

login.startProgram();

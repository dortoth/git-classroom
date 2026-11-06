#!/usr/bin/env node

import { Login } from './auth/login.js';
import { MainMenu } from './menus/main-menu.js';
import { GitHubService } from './services/github-service.js';
import { GitLabService } from './services/gitlab-service.js';
import { Utils } from './utils/utils.js';
import { TokenManagement } from './auth/token-management.js';
import { ManageMembersMenu } from './menus/manage-members-menu.js';
import { ClassroomMenu } from './menus/classroom-menu.js';
import { TemplateRepositoryMenu } from './menus/template-repository-menu.js';

const utils = new Utils();
const hubService = new GitHubService();
const labService = new GitLabService();
const membersMenu = new ManageMembersMenu(hubService, labService, utils);
const classroomMenu = new ClassroomMenu();
const templateRepoMenu = new TemplateRepositoryMenu();
const menu = new MainMenu(utils, membersMenu, classroomMenu, templateRepoMenu);
membersMenu.setMainMenu(menu);
menu.setServices(hubService, labService);

const login = new Login(
  hubService,
  labService,
  utils,
  menu,
  new TokenManagement(hubService, labService, utils),
);

login.startProgram();

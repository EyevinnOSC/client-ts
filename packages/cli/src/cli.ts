#! /usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import cmdAdmin from './admin/cmd';
import * as cmdUser from './user/cmd';
import cmdCompare from './vmaf/cmd';
import cmdPackager from './packager/cmd';
import cmdLive from './live/cmd';
import cmdIntercom from './intercom/cmd';
import cmdTranscribe from './transcribe/cmd';
import cmdDb from './db/cmd';
import { cmdChat } from './architect/cmd';
import { cmdVod } from './vod/cmd';
import { cmdWeb } from './web/cmd';

const cli = new Command();

// Read package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

cli.version(packageJson.version, '-v, --version', 'Output the current version');

cli
  .configureHelp({ showGlobalOptions: true })
  .option(
    '--env <environment>',
    'Environment to use (overrides ENVIRONMENT env var)',
    process.env.ENVIRONMENT || 'prod'
  );

cli.addCommand(cmdAdmin());
cli.addCommand(cmdUser.cmdList());
cli.addCommand(cmdUser.cmdCreate());
cli.addCommand(cmdUser.cmdDescribe());
cli.addCommand(cmdUser.cmdRemove());
cli.addCommand(cmdUser.cmdLogs());
cli.addCommand(cmdUser.cmdRestart());
cli.addCommand(cmdUser.cmdGetInstanceReplicas());
cli.addCommand(cmdUser.cmdSetInstanceReplicas());
cli.addCommand(cmdUser.cmdServiceAccessToken());
cli.addCommand(cmdUser.cmdReservedNodes());
cli.addCommand(cmdUser.cmdSecrets());
cli.addCommand(cmdPackager());
cli.addCommand(cmdCompare());
cli.addCommand(cmdLive());
cli.addCommand(cmdIntercom());
cli.addCommand(cmdTranscribe());
cli.addCommand(cmdDb());
cli.addCommand(cmdChat());
cli.addCommand(cmdVod());
cli.addCommand(cmdWeb());
cli.parse(process.argv);

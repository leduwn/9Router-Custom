#!/usr/bin/env node

process.env.NINEROUTER_CLI_ROOT ||= __dirname;
require("./dist/cli.js");

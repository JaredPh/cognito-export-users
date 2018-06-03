#!/usr/bin/env node

const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const fs = require('fs');
const JSONStream = require('JSONStream');
const meow = require('meow');
const path = require('path');
const term = require('terminal-kit').terminal;

const time = require('./timer.js');

const cli = meow(`
    Usage
      cognito-export-users <user-pool-id> <options>
    
      AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY can be specified in env variables or ~/.aws/credentials

    Options
      --file File name to export/import single pool users to (defaults to user-pool-id.json)
      --dir Path to export all pools, all users to (defaults to current dir)
`);

if (!cli.input[0]) {
  cli.showHelp();
}

const UserPoolId = cli.input[0];
const region = UserPoolId.substring(0, UserPoolId.indexOf('_'));

const cognitoIsp = new AWS.CognitoIdentityServiceProvider({ region });

const file = path.join(
  cli.flags.dir || '.',
  cli.flags.file || `${UserPoolId}.json`,
);

const writeStream = fs.createWriteStream(file);
const stringify = JSONStream.stringify();

stringify.pipe(writeStream);

const getUsers = async (token, requestNumber = 1, attemptNumber = 1) => {
  const promise = bluebird.resolve(cognitoIsp.listUsers({
    UserPoolId,
    PaginationToken: token,
  }).promise());

  let nextToken;
  let nextRequestNumber;
  let nextAttemptNumber;

  try {
    const {
      Users,
      PaginationToken,
    } = await promise;

    Users.forEach(item => stringify.write(item));

    term(`request #${requestNumber}: `).green('success\n');

    time.resetWaitTime();

    nextRequestNumber = requestNumber + 1;
    nextAttemptNumber = 1;

    nextToken = PaginationToken;
  } catch (e) {
    term(`request #${requestNumber} (attempt#: ${attemptNumber}): `).red(`fail - ${e.code}\n`);

    await time.wait();
    time.increaseWaitTime();

    nextToken = token;
    nextRequestNumber = requestNumber;
    nextAttemptNumber = attemptNumber + 1;
  }

  if (nextToken === undefined) {
    stringify.end();
    writeStream.end();
  } else {
    getUsers(nextToken, nextRequestNumber, nextAttemptNumber);
  }
};

getUsers();

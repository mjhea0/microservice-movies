const AWS = require('aws-sdk');

const createUsersTaskDefinition = require('../tasks/users-review_task').createUsersTaskDefinition;
const createMoviesTaskDefinition = require('../tasks/movies-review_task').createMoviesTaskDefinition;
const createWebTaskDefinition = require('../tasks/web-review_task').createWebTaskDefinition;


// globals

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_USERNAME = process.env.AWS_USERNAME;
const AWS_CONFIG_REGION = 'us-west-2';
const SHORT_GIT_HASH = process.env.CIRCLE_SHA1.substring(0, 7);


// config

AWS.config = new AWS.Config();
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;
AWS.config.region = AWS_CONFIG_REGION;


// init aws services

const ecs = new AWS.ECS();


// methods

function ensureAuthenticated() {
  return new Promise((resolve, reject) => {
    const iam = new AWS.IAM();
    const params = { UserName: AWS_USERNAME };
    iam.getUser(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function getTaskDefinitionRevision(taskDefinitionName) {
  return new Promise((resolve, reject) => {
    const params = { taskDefinition: taskDefinitionName };
    ecs.describeTaskDefinition(params, function(err, data) {
      if (err) {
        if (err.message === 'Unable to describe task definition.') {
          resolve(1);
        }
        reject(err.message);
      } else {
        const revision = data.taskDefinition.revision;
        resolve(revision);
      }
    });
  });
}

function registerTaskDef(task) {
  return new Promise((resolve, reject) => {
    const params = task;
    ecs.registerTaskDefinition(params, (err, data) => {
      console.log(data);
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function registerUsersTD(taskDefinitionName) {
  getTaskDefinitionRevision('microservicemovies-review-users-td')
  .then((revision) => {
    const task = createUsersTaskDefinition(AWS_ACCOUNT_ID, AWS_CONFIG_REGION, SHORT_GIT_HASH, taskDefinitionName, revision);
    return registerTaskDef(task);
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
}

function registerMoviesTD(taskDefinitionName) {
  getTaskDefinitionRevision('microservicemovies-review-movies-td')
  .then((revision) => {
    const task = createMoviesTaskDefinition(AWS_ACCOUNT_ID, AWS_CONFIG_REGION, SHORT_GIT_HASH, taskDefinitionName, revision);
    return registerTaskDef(task);
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
}

function registerWebTD(taskDefinitionName) {
  getTaskDefinitionRevision('microservicemovies-review-web-td')
  .then((revision) => {
    const task = createWebTaskDefinition(AWS_ACCOUNT_ID, AWS_CONFIG_REGION, SHORT_GIT_HASH, taskDefinitionName, revision);
    return registerTaskDef(task);
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
}


// main

return ensureAuthenticated()
.then((data) => {
  console.log(`Welcome ${data.User.UserName}!`);
  registerUsersTD();
  registerMoviesTD();
  registerWebTD();
})
.catch((err) => { console.log(err); });

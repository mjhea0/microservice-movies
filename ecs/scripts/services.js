const AWS = require('aws-sdk');

const createUsersService = require('../services/users-review_service').createUsersService;
const createMoviesService = require('../services/movies-review_service').createMoviesService;
const createWebService = require('../services/web-review_service').createWebService;


// globals

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_USERNAME = process.env.AWS_USERNAME;
const AWS_CONFIG_REGION = 'us-west-2';
const SHORT_GIT_HASH = process.env.CIRCLE_SHA1.substring(0, 7);
const LOAD_BALANCER_ARN = 'arn:aws:elasticloadbalancing:us-west-2:046505967931:loadbalancer/app/microservicemovies-review/493be740ee6aea54';
const CLUSTER_NAME = 'microservicemovies-review';

let USERS_TARGET_GROUP_ARN;
let MOVIES_TARGET_GROUP_ARN;
let WEB_TARGET_GROUP_ARN;


// config

AWS.config = new AWS.Config();
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;
AWS.config.region = AWS_CONFIG_REGION;


// init aws services

const ecs = new AWS.ECS();
const iam = new AWS.IAM();
const elbv2 = new AWS.ELBv2();


// methods

function ensureAuthenticated() {
  return new Promise((resolve, reject) => {
    const params = { UserName: AWS_USERNAME };
    iam.getUser(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function addService(service) {
  return new Promise((resolve, reject) => {
    const params = service;
    ecs.createService(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function getTargetGroups() {
  return new Promise((resolve, reject) => {
    var params = {
      LoadBalancerArn: LOAD_BALANCER_ARN
    };
    elbv2.describeTargetGroups(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}


// main

return ensureAuthenticated()
.then((data) => {
  console.log(`Welcome ${data.User.UserName}!`);
  return getTargetGroups();
})
.then((res) => {
  const groups = res.TargetGroups.filter((group) => {
    return group.TargetGroupName.includes(SHORT_GIT_HASH);
  });
  for (const group of groups) {
    if (group.TargetGroupName.includes('users')) {
      USERS_TARGET_GROUP_ARN = group.TargetGroupArn;
    }
    if (group.TargetGroupName.includes('movies')) {
      MOVIES_TARGET_GROUP_ARN = group.TargetGroupArn;
    }
    if (group.TargetGroupName.includes('web')) {
      WEB_TARGET_GROUP_ARN = group.TargetGroupArn;
    }
  }
  const userServiceParams = createUsersService(
    CLUSTER_NAME, `${SHORT_GIT_HASH}-users`, USERS_TARGET_GROUP_ARN);
  return addService(userServiceParams);
})
.then((res) => {
  console.log('Service Added!');
  const moviesServiceParams = createMoviesService(
    CLUSTER_NAME, `${SHORT_GIT_HASH}-movies`, MOVIES_TARGET_GROUP_ARN);
  return addService(moviesServiceParams);
})
.then((res) => {
  console.log('Service Added!');
  const webServiceParams = createWebService(
    CLUSTER_NAME, `${SHORT_GIT_HASH}-web`, WEB_TARGET_GROUP_ARN);
  return addService(webServiceParams);
})
.then((res) => {
  console.log('Service Added!');
})
.catch((err) => { console.log(err); });

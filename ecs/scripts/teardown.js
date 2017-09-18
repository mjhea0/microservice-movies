const AWS = require('aws-sdk');


// globals

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_USERNAME = process.env.AWS_USERNAME;
const AWS_CONFIG_REGION = 'us-west-2';
const LOAD_BALANCER_ARN = 'arn:aws:elasticloadbalancing:us-west-2:046505967931:loadbalancer/app/microservicemovies-review/493be740ee6aea54';

const ARGS = process.argv.slice(2);
const USAGE_MESSAGE = '\nusage:\n  teardown.js LISTENER_PORT COMMIT_SHA\n';

if (!ARGS[0] || !ARGS[1]) {
  console.log(USAGE_MESSAGE);
  return;
}

const SHORT_GIT_HASH = ARGS[1].substring(0, 7);
const CLUSTER_NAME = 'microservicemovies-review';


// config

AWS.config = new AWS.Config();
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;
AWS.config.region = AWS_CONFIG_REGION;


// init aws services

const iam = new AWS.IAM();
const elbv2 = new AWS.ELBv2();
const ecs = new AWS.ECS();


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

function getListeners() {
  return new Promise((resolve, reject) => {
    var params = {
      LoadBalancerArn: LOAD_BALANCER_ARN
    };
    elbv2.describeListeners(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function removeListener(listener) {
  return new Promise((resolve, reject) => {
    var params = {
      ListenerArn: listener
    };
    elbv2.deleteListener(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function getTargetGroups() {
  return new Promise((resolve, reject) => {
    var params = {};
    elbv2.describeTargetGroups(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function removeTargetGroup(targetgroup) {
  return new Promise((resolve, reject) => {
    var params = { TargetGroupArn: targetgroup };
    elbv2.deleteTargetGroup(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function updateServiceCount(serviceName) {
  return new Promise((resolve, reject) => {
    var params = {
      service: serviceName,
      desiredCount: 0,
      cluster: CLUSTER_NAME
    };
    ecs.updateService(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function removeService(serviceName) {
  return new Promise((resolve, reject) => {
    var params = {
      service: serviceName,
      cluster: CLUSTER_NAME
    };
    ecs.deleteService(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}


// main

return ensureAuthenticated()
.then((data) => {
  console.log(`Welcome ${data.User.UserName}!`);
  return getListeners();
})
.then((res) => {
  const listener = res.Listeners.filter((listener) => {
    return parseInt(listener.Port) === parseInt(ARGS[0]);
  })[0];
  if (!listener) {
    throw new Error('Listener does not exist.');
  }
  return removeListener(listener.ListenerArn);
})
.then((res) => {
  console.log('Listener Removed!');
  return getTargetGroups();
})
.then((res) => {
  const targets = res.TargetGroups.filter((group) => {
    return group.TargetGroupName.includes(SHORT_GIT_HASH);
  });
  if (!targets.length) {
    throw new Error('Targets do not exist.');
  }
  const promises = targets.map((target) => {
    return removeTargetGroup(target.TargetGroupArn);
  });
  return Promise.all(promises);
})
.then(() => {
  console.log('Target Groups Removed!');
  return updateServiceCount(`${SHORT_GIT_HASH}-users`);
})
.then(() => {
  console.log('Service Updated!');
  return removeService(`${SHORT_GIT_HASH}-users`);
})
.then(() => {
  console.log('Service Removed!');
  return updateServiceCount(`${SHORT_GIT_HASH}-movies`);
})
.then(() => {
  console.log('Service Updated!');
  return removeService(`${SHORT_GIT_HASH}-movies`);
})
.then((res) => {
  console.log('Service Removed!');
  return updateServiceCount(`${SHORT_GIT_HASH}-web`);
})
.then((res) => {
  console.log('Service Updated!');
  return removeService(`${SHORT_GIT_HASH}-web`);
})
.then((res) => {
  console.log('Service removed!');
})
.catch((err) => { console.log(err); });

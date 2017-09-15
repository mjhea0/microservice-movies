const AWS = require('aws-sdk');


// globals

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_USERNAME = process.env.AWS_USERNAME;
const AWS_CONFIG_REGION = 'us-west-2';

const clusterName = 'microservicemovies-review';


// config

AWS.config = new AWS.Config();
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;
AWS.config.region = AWS_CONFIG_REGION;


// init aws services

const ecs = new AWS.ECS();
const iam = new AWS.IAM();


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

function confirmRegion() {
  return new Promise((resolve, reject) => {
    if (AWS.config.region !== AWS_CONFIG_REGION) {
      reject('Something went wrong!');
    }
    resolve(AWS_CONFIG_REGION);
  });
}

function getCluster() {
  return new Promise((resolve, reject) => {
    const params = { clusters: [ clusterName ] };
    ecs.describeClusters(params, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}


// main

return ensureAuthenticated()
.then((data) => {
  console.log(`Welcome ${data.User.UserName}!`);
  return confirmRegion();
})
.then((region) => {
  console.log(`AWS Region -> ${region}`);
  return getCluster();
})
.then((cluster) => {
  if (!cluster.clusters.length) {
    console.log('Cluster does not exist!');
    return;
  }
  console.log(`ECS Cluster -> ${cluster.clusters[0].clusterName}`);
})
.catch((err) => { console.log(err); });

const AWS = require('aws-sdk');


// globals

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_USERNAME = process.env.AWS_USERNAME;
const AWS_CONFIG_REGION = 'us-west-2';
const LOAD_BALANCER_ARN = 'arn:aws:elasticloadbalancing:us-west-2:046505967931:loadbalancer/app/microservicemovies-review/493be740ee6aea54';


// config

AWS.config = new AWS.Config();
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;
AWS.config.region = AWS_CONFIG_REGION;


// init aws services

const elbv2 = new AWS.ELBv2();


// methods

function getPort() {
  return new Promise((resolve, reject) => {
    var params = {
      LoadBalancerArn: LOAD_BALANCER_ARN
    };
    elbv2.describeListeners(params, (err, data) => {
      if (err) { reject(err); }
      const max = data.Listeners.reduce((prev, current) => {
        return (prev.Port > current.Port) ? prev : current;
      });
      if (parseInt(max.Port) === 80) {
        resolve(30000);
      } else {
        const port = parseInt(max.Port) + 1;
        resolve(port);
      }
    });
  });
}


module.exports = {
  getPort
};

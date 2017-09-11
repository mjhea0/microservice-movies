#!/usr/bin/env bash

###################################
### ECS Deployment Setup Script ###
###################################


# config

set -e
JQ="jq --raw-output --exit-status"

ECS_REGION="us-east-1"
ECS_CLUSTER="microservicemovies-review"
VPC_ID="vpc-de9d90a7"
LOAD_BALANCER_ARN="arn:aws:elasticloadbalancing:us-east-1:046505967931:loadbalancer/app/microservicemovies-review/90696c5b5a4c298d"
DEFAULT_TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:us-east-1:046505967931:targetgroup/review-default/cc1a3355ef993e5d
"

# helpers

configure_aws_cli() {
  echo "Configuring AWS..."
  aws --version
  aws configure set default.region $ECS_REGION
  aws configure set default.output json
  echo "AWS configured!"
}

get_cluster() {
  echo "Finding cluster..."
  command = "aws ecs describe-clusters --cluster $ECS_CLUSTER"
  if [[ $( $command | $JQ ".clusters[0].status") == 'ACTIVE' ]]; then
      echo "Cluster found!"
  else
      echo "Error finding cluster."
      return 1
  fi
}


# main

configure_aws_cli
get_cluster

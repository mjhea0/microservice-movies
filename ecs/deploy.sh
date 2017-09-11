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
DEFAULT_TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:us-east-1:046505967931:targetgroup/review-default/cc1a3355ef993e5d"
NAMESPACE="sample"
IMAGE_BASE="microservicemovies"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${ECS_REGION}.amazonaws.com"
SHORT_GIT_HASH=$(echo $CIRCLE_SHA1 | cut -c -7)
TAG=$SHORT_GIT_HASH


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
  command="aws ecs describe-clusters --cluster $ECS_CLUSTER"
  if [[ $( $command | $JQ ".clusters[0].status") == 'ACTIVE' ]]; then
      echo "Cluster found!"
  else
      echo "Error finding cluster."
      return 1
  fi
}

deploy_users() {
  echo "Deploying users service..."
  echo "(1) Tagging and pushing images..."
  $(aws ecr get-login --region "${ECS_REGION}")
	docker tag ${IMAGE_BASE}_users-db-review ${ECR_URI}/${NAMESPACE}/users-db-review:${TAG}
	docker tag ${IMAGE_BASE}_users-service-review ${ECR_URI}/${NAMESPACE}/users-service-review:${TAG}
	docker push ${ECR_URI}/${NAMESPACE}/users-db-review:${TAG}
  docker push ${ECR_URI}/${NAMESPACE}/users-service-review:${TAG}
  echo "Images tagged and pushed!"
}

deploy_movies() {
  echo "Deploying movies service..."
  echo "(1) Tagging and pushing images..."
  $(aws ecr get-login --region "${ECS_REGION}")
	docker tag ${IMAGE_BASE}_movies-db-review ${ECR_URI}/${NAMESPACE}/movies-db-review:${TAG}
	docker tag ${IMAGE_BASE}_movies-service-review ${ECR_URI}/${NAMESPACE}/movies-service-review:${TAG}
	docker tag ${IMAGE_BASE}_swagger-review ${ECR_URI}/${NAMESPACE}/swagger-review:${TAG}
	docker push ${ECR_URI}/${NAMESPACE}/movies-db-review:${TAG}
	docker push ${ECR_URI}/${NAMESPACE}/movies-service-review:${TAG}
	docker push ${ECR_URI}/${NAMESPACE}/swagger-review:${TAG}
  echo "Images tagged and pushed!"
}

deploy_web() {
  echo "Deploying web service..."
  echo "(1) Tagging and pushing images..."
  $(aws ecr get-login --region "${ECS_REGION}")
	docker tag ${IMAGE_BASE}_web-service-review ${ECR_URI}/${NAMESPACE}/web-service-review:${TAG}
	docker push ${ECR_URI}/${NAMESPACE}/web-service-review:${TAG}
  echo "Images tagged and pushed!"
}


# main

configure_aws_cli
get_cluster
deploy_users
deploy_movies
deploy_web

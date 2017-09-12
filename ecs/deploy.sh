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
  if [[ $($command | $JQ ".clusters[0].status") == 'ACTIVE' ]]; then
      echo "Cluster found!"
  else
      echo "Error finding cluster."
      return 1
  fi
}

register_definition() {
  echo "(3) Registering task definition..."
  command='aws ecs register-task-definition --cli-input-json "$task_def" --family $family'
  if revision=$($command | $JQ '.taskDefinition.taskDefinitionArn'); then
    echo "Revision: $revision"
    echo "Task definition registered!"
  else
    echo "Failed to register task definition"
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
  echo "(2) Creating users task definition..."
  family="sample-users-review-td"
  template="users-review_task.json"
  task_template=$(cat "ecs/tasks/$template")
  task_def=$(printf "$task_template" $AWS_ACCOUNT_ID $ECS_REGION $TAG $ECS_REGION $AWS_ACCOUNT_ID $ECS_REGION $TAG $ECS_REGION)
  echo "$task_def"
  echo "Users task definition created!"
  register_definition
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
  echo "(2) Creating movies task definition..."
  family="sample-movies-review-td"
  template="movies-review_task.json"
  task_template=$(cat "ecs/tasks/$template")
  task_def=$(printf "$task_template" $AWS_ACCOUNT_ID $ECS_REGION $TAG $ECS_REGION $AWS_ACCOUNT_ID $ECS_REGION $TAG $ECS_REGION $AWS_ACCOUNT_ID $ECS_REGION $TAG $ECS_REGION)
  echo "$task_def"
  echo "Movies task definition created!"
  register_definition
}

deploy_web() {
  echo "Deploying web service..."
  echo "(1) Tagging and pushing images..."
  $(aws ecr get-login --region "${ECS_REGION}")
	docker tag ${IMAGE_BASE}_web-service-review ${ECR_URI}/${NAMESPACE}/web-service-review:${TAG}
	docker push ${ECR_URI}/${NAMESPACE}/web-service-review:${TAG}
  echo "Images tagged and pushed!"
  echo "(2) Creating web task definition..."
  family="sample-web-review-td"
  template="web-review_task.json"
  task_template=$(cat "ecs/tasks/$template")
  task_def=$(printf "$task_template" $AWS_ACCOUNT_ID $ECS_REGION $TAG $ECS_REGION)
  echo "$task_def"
  echo "Web task definition created!"
  register_definition
}

# main

configure_aws_cli
get_cluster
deploy_users
deploy_movies
deploy_web

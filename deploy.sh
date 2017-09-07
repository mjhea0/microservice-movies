#!/usr/bin/env bash

###################################
### ECS Deployment Setup Script ###
###################################


# config

set -e
JQ="jq --raw-output --exit-status"

ECS_REGION="us-east-1"
ECS_CLUSTER="review"
VPC_ID="vpc-26ba875f"
LOAD_BALANCER_LISTENER_ARN="arn:aws:elasticloadbalancing:us-east-1:046505967931:listener/app/ecs/1dec50e459068da0/e78a1bac4963dfaf"
NAMESPACE="sample"
IMAGE_BASE="microservicemovies"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${ECS_REGION}.amazonaws.com"
SHORT_GIT_HASH=$(echo $CIRCLE_SHA1 | cut -c -7)
TARGET_GROUP=$SHORT_GIT_HASH


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
  if [[ $(aws ecs describe-clusters --cluster $ECS_CLUSTER | $JQ ".clusters[0].status") == 'ACTIVE' ]]; then
		echo "Cluster found!"
	else
		echo "Error finding cluster."
		return 1
  fi
}

tag_and_push_images() {
	echo "Tagging and pushing images..."
	$(aws ecr get-login --region "${ECS_REGION}")
	# tag
	docker tag ${IMAGE_BASE}_users-db-review ${ECR_URI}/${NAMESPACE}/users-db-review:review
	docker tag ${IMAGE_BASE}_movies-db-review ${ECR_URI}/${NAMESPACE}/movies-db-review:review
	docker tag ${IMAGE_BASE}_users-service-review ${ECR_URI}/${NAMESPACE}/users-service-review:review
	docker tag ${IMAGE_BASE}_movies-service-review ${ECR_URI}/${NAMESPACE}/movies-service-review:review
	docker tag ${IMAGE_BASE}_web-service-review ${ECR_URI}/${NAMESPACE}/web-service-review:review
	docker tag ${IMAGE_BASE}_swagger-review ${ECR_URI}/${NAMESPACE}/swagger-review:review
	# push
	docker push ${ECR_URI}/${NAMESPACE}/users-db-review:review
	docker push ${ECR_URI}/${NAMESPACE}/movies-db-review:review
	docker push ${ECR_URI}/${NAMESPACE}/users-service-review:review
	docker push ${ECR_URI}/${NAMESPACE}/movies-service-review:review
	docker push ${ECR_URI}/${NAMESPACE}/web-service-review:review
	docker push ${ECR_URI}/${NAMESPACE}/swagger-review:review
	echo "Images tagged and pushed!"
}

create_task_defs() {
  # users
	echo "Creating users task definition..."
  family="sample-users-review-td"
  template="users-review.json"
  task_template=$(cat "ecs/tasks/$template")
  task_def=$(printf "$task_template" $AWS_ACCOUNT_ID $ECS_REGION $ECS_REGION $AWS_ACCOUNT_ID $ECS_REGION $ECS_REGION)
  echo "$task_def"
  echo "Users task definition created!"
  register_definition
	create_target_group "users" "3000" "/users/ping"
  # movies
	echo "Creating movies task definition..."
  family="sample-movies-review-td"
  template="movies-review.json"
  task_template=$(cat "ecs/tasks/$template")
  task_def=$(printf "$task_template" $AWS_ACCOUNT_ID $ECS_REGION $ECS_REGION $AWS_ACCOUNT_ID $ECS_REGION $ECS_REGION $AWS_ACCOUNT_ID $ECS_REGION $ECS_REGION)
  echo "$task_def"
  echo "Movies task definition created!"
  register_definition
	create_target_group "movies" "3000" "/movies/ping"
  # web
	echo "Creating web task definition..."
  family="sample-web-review-td"
  template="web-review.json"
  task_template=$(cat "ecs/tasks/$template")
  task_def=$(printf "$task_template" $AWS_ACCOUNT_ID $ECS_REGION $ECS_REGION)
  echo "$task_def"
  echo "Web task definition created!"
  register_definition
	create_target_group "web" "9000" "/"
}

register_definition() {
  echo "Registering task definition..."
  if revision=$(aws ecs register-task-definition --cli-input-json "$task_def" --family $family | $JQ '.taskDefinition.taskDefinitionArn'); then
    echo "Revision: $revision"
    echo "Task definition registered!"
  else
    echo "Failed to register task definition"
    return 1
  fi
}

create_target_group() {
	echo "Creating target group..."
	if [[ $(aws elbv2 create-target-group --name "$TARGET_GROUP-$1" --protocol HTTP --port $2 --vpc-id $VPC_ID --health-check-path $3 | $JQ ".TargetGroups[0].TargetGroupName") == "$TARGET_GROUP-$1" ]]; then
		echo "Target group created!"
	else
		echo "Error creating target group."
		return 1
  fi
}

create_service() {
	echo "Creating service..."
  if [[ $(aws ecs create-service --cluster $ECS_CLUSTER --service-name "$ECS_SERVICE-$1" --task-definition $revision --desired-count 1 | $JQ ".service.taskDefinition") == $revision ]]; then
		echo "Service created!"
	else
		echo "Error creating service."
		return 1
  fi
}


# main

configure_aws_cli
get_cluster
tag_and_push_images
create_task_defs

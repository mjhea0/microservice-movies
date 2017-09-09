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
LOAD_BALANCER_ARN="arn:aws:elasticloadbalancing:us-east-1:046505967931:loadbalancer/app/ecs/1dec50e459068da0"
SAMPLE_TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:us-east-1:046505967931:targetgroup/sample/a0d69d13b86e6813"
NAMESPACE="sample"
IMAGE_BASE="microservicemovies"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${ECS_REGION}.amazonaws.com"
SHORT_GIT_HASH=$(echo $CIRCLE_SHA1 | cut -c -7)
TARGET_GROUP=$SHORT_GIT_HASH
ECS_SERVICE=$SHORT_GIT_HASH


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
	get_target_group_arn "users"
  add_rules "1" "/users*"
	service_template_name="users-review_service.json"
	service_template=$(cat "ecs/services/$service_template_name")
	service=$(printf "$service_template" $ECS_CLUSTER "$ECS_SERVICE-users" $revision $target_group_arn)
	echo "$service"
	create_service
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
	get_target_group_arn "movies"
  add_rules "2" "/movies*"
	service_template_name="movies-review_service.json"
	service_template=$(cat "ecs/services/$service_template_name")
	service=$(printf "$service_template" $ECS_CLUSTER "$ECS_SERVICE-movies" $revision $target_group_arn)
	echo "$service"
	create_service
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
  add_rules "3" "/"
	service_template_name="web-review_service.json"
  service_template=$(cat "ecs/services/$service_template_name")
  service=$(printf "$service_template" $ECS_CLUSTER "$ECS_SERVICE-web" $revision $target_group_arn)
  echo "$service"
	create_service
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

get_target_group_arn() {
	echo "Getting target group arn..."
  if target_group_arn=$(aws elbv2 describe-target-groups --name "$TARGET_GROUP-$1" | $JQ ".TargetGroups[0].TargetGroupArn"); then
    echo "Target group arn: $target_group_arn"
  else
    echo "Failed to get target group arn."
    return 1
  fi
}

get_listener_port() {
	echo "Getting listener port..."
  if port=$(aws elbv2 describe-listeners --load-balancer-arn $LOAD_BALANCER_ARN | $JQ ".Listeners | max_by(.Port) | .Port"); then
		port=$(($port+1))
    echo "Listener port: $port"
  else
    echo "Failed to get listener port."
    return 1
  fi
}

create_listener() {
	echo "Creating listener..."
	if load_balaner_listener_arn=$(aws elbv2 create-listener --load-balancer-arn $LOAD_BALANCER_ARN --protocol HTTP --port 30334 --default-actions Type=forward,TargetGroupArn=$SAMPLE_TARGET_GROUP_ARN | $JQ ".Listeners[0].ListenerArn"); then
		echo "Listener created - $load_balaner_listener_arn"
	else
		echo "Error creating listener."
		return 1
  fi
}

add_rules() {
	echo "Add rules..."
	if [[ $(aws elbv2 create-rule --listener-arn $load_balaner_listener_arn --priority $1 --conditions Field=path-pattern,Values="$2" --actions Type=forward,TargetGroupArn=$target_group_arn | $JQ ".Rules[0].Actions[0].TargetGroupArn") == $target_group_arn ]]; then
		echo "Rules created!"
	else
		echo "Error creating rule."
		return 1
  fi
}

create_service() {
	echo "Creating service..."
  if [[ $(aws ecs create-service --cli-input-json "$service" | $JQ ".service.taskDefinition") == $revision ]]; then
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
get_listener_port
create_listener
create_task_defs

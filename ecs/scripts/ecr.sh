#!/usr/bin/env bash


# config

set -e

ECS_REGION="us-west-2"
NAMESPACE="microservicemovies"
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

tag_and_push_images() {
  echo "Tagging and pushing images..."
  $(aws ecr get-login --region "${ECS_REGION}")
  # tag
  docker tag ${IMAGE_BASE}_users-db-review ${ECR_URI}/${NAMESPACE}/users-db-review:${TAG}
  docker tag ${IMAGE_BASE}_movies-db-review ${ECR_URI}/${NAMESPACE}/movies-db-review:${TAG}
  docker tag ${IMAGE_BASE}_users-service-review ${ECR_URI}/${NAMESPACE}/users-service-review:${TAG}
  docker tag ${IMAGE_BASE}_movies-service-review ${ECR_URI}/${NAMESPACE}/movies-service-review:${TAG}
  docker tag ${IMAGE_BASE}_web-service-review ${ECR_URI}/${NAMESPACE}/web-service-review:${TAG}
  docker tag ${IMAGE_BASE}_swagger-review ${ECR_URI}/${NAMESPACE}/swagger-review:${TAG}
  # push
  docker push ${ECR_URI}/${NAMESPACE}/users-db-review:${TAG}
  docker push ${ECR_URI}/${NAMESPACE}/movies-db-review:${TAG}
  docker push ${ECR_URI}/${NAMESPACE}/users-service-review:${TAG}
  docker push ${ECR_URI}/${NAMESPACE}/movies-service-review:${TAG}
  docker push ${ECR_URI}/${NAMESPACE}/web-service-review:${TAG}
  docker push ${ECR_URI}/${NAMESPACE}/swagger-review:${TAG}
  echo "Images tagged and pushed!"
}

# main

configure_aws_cli
tag_and_push_images

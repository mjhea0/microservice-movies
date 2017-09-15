function createMoviesService(cluster, name, targetGroup) {
  const params = {
    cluster: cluster,
    serviceName: name,
    taskDefinition: 'microservicemovies-review-movies-td',
    loadBalancers: [
      {
        targetGroupArn: targetGroup,
        containerName: "movies-service-review",
        containerPort: 3000
      }
    ],
    desiredCount: 1,
    role: "ecsServiceRole"
  };
  return params;
}

module.exports = {
  createMoviesService
};

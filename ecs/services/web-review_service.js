function createWebService(cluster, name, targetGroup) {
  const params = {
    cluster: cluster,
    serviceName: name,
    taskDefinition: 'microservicemovies-review-web-td',
    loadBalancers: [
      {
        targetGroupArn: targetGroup,
        containerName: "web-service-review",
        containerPort: 9000
      }
    ],
    desiredCount: 1,
    role: "ecsServiceRole"
  };
  return params;
}

module.exports = {
  createWebService
};

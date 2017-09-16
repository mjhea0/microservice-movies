# Video Transcript

Welcome! This is just a quick demo of the finished product from this blog post. Essentially, we will be using Docker and AWS ECS - Amazon's container orchestration service - to deploy 6 microservices.

SHOW SERVICES

Let's quickly look at the development workflow...

1. We've already created a feature branch and made some code changes so we'll go ahead and push the changes to GitHub.
1. This will trigger a new build on Circle CI. The containers will spin up up and the tests will run. If the build passes, a series of deployment scripts will fire, which sets up a number of resources on AWS and spins up the environment with a unique URL - based on an open port.
1. Next, we can run the e2e tests with TestCafe.
1. Finally, when we're done testing, let's bring down the AWS resources using the teardown script. We simply need to pass in the port used for Listener attached to the load balancer along with the commit SHA associated with the deploy.

That's it. Thanks for watching!

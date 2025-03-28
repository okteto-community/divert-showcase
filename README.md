# Okteto Divert Showcase

Okteto Divert allows you to spin up Development Environments that include **only the services you're actively working on**, while routing all other service traffic to a **shared environment**. This dramatically reduces infrastructure cost and speeds up environment startup—especially for large microservice applications.  
👉 [Learn more about Divert in our docs](https://www.okteto.com/docs/reference/okteto-manifest/#divert)

This repository contains examples of the different patterns that you can leverage when using Divert. Our goal is to use this examples to showcase the different architectural patterns that you can implement with Okteto Divert.

> **Note:** These examples require **Okteto Platform v1.30.1 or later**

## Scenarios

1. [Chain of Services via Ingress](chain-of-services-via-ingress): Demonstrates how to use divert when you call all your services via a single shared ingress.
2. [Chain of Services via Service Discovery](chain-of-services-via-discovery): Shows how to use Divert when services talk to each other using Kubernetes’ internal DNS (`service-name.namespace.svc.cluster.local`).
3. [Producer-Consumer](producer-consumer): Demonstrates Divert in an event-driven architecture using Kafka to pass messages between services.
4. [Movies App](https://github.com/okteto/movies-catalog): A real-world example where a frontend app interacts with multiple backend services. This shows how Divert enables developing just the frontend (or one backend) while reusing the rest.

## Getting Started with Divert

Here’s how to run a sample locally using Okteto Divert:

1. Create a namespace called `staging`. This is the namespace that will hold the shared environment. If you prefer to use a different name, update the value on the `.env` file of the sample
2. On the `staging` namespace, deploy the full application: `okteto deploy -n=staging`
3. Verify that the application works by accessing its endpoints
4. On your personal namespace, only deploy the services that you want to develop on (e.g `okteto deploy -f okteto.serviceb.yaml`)
5. From your personal namespace, access the endpoints. Notice how the responses change between shared and `diverted` services.

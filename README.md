# Okteto Divert Showcase

Divert allows you to create Development Environments that include only the services you are actively working on while leveraging a shared environment for all other microservices. This approach significantly reduces infrastructure costs and complexity, especially in large environments. [You can learn more about divert in our documentation](https://www.okteto.com/docs/tutorials/divert/).

This repository contains examples of the different patterns that you can leverage when using Divert. Our goal is to use this examples to showcase the different architectural patterns that you can implement with Okteto Divert.

These samples require Okteto Platform 1.30.1 or newer.

## Scenarios

1. [Chain of Services via Ingress](chain-of-services-via-ingress): This demo shows you how to use divert when you call your services via a single ingress for all.
1. [Chain of Services via Service Discovery](chain-of-services-via-discovery): This demo shows you how to use divert when you call your services using the Kubernetes service discovery mechanisms.
1. [Producer-Consumer](producer-consumer): This demo shows you how to use divert with Kafka.
1. [Movies App](https://github.com/okteto/movies-catalog): This demo shows you how to use divert when your frontend calls multiple services

## How to work with Divert?

1. Create a namespace called `staging`. This is the namespace that will hold the shared environment. If you prefer to use a different name, update the value on the `.env` file of the sample
2. On the `staging` namespace, deploy the full application: `okteto deploy -n=staging`
3. Verify that the application works by accessing their endpoints
4. On your personal namespace, only deploy the services that you want to develop on (e.g `okteto deploy -f okteto.serviceb.yaml`)
5. From your personal namespace, access the endpoints. Notice how the responses change between shared and `diverted` services.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.67.0"
    }
  }

  backend "kubernetes" {
    secret_suffix    = "okteto"
  }

  required_version = ">= 1.2.0"
}

variable "queue_name" {
  description = "Name of the SQS Queue"
  type        = string
  default     = ""
  validation {
    condition     = length(var.queue_name) > 1
    error_message = "Please specify the name of the SQS queue"
  }
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

provider "aws" {
  region  = var.region
}

resource "aws_sqs_queue" "queue"  {
    name = var.queue_name
}

output "queue_url" {
  value = aws_sqs_queue.queue.url
  description = "The URL of the SQS queue"
}

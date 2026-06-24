# EX24 - DynamoDB Application on EKS with IRSA

## 📌 Project Overview
This project demonstrates a production-ready cloud architecture deploying a containerized Node.js REST API to an Amazon Elastic Kubernetes Service (EKS) cluster. The application interacts securely with Amazon DynamoDB without hardcoded credentials by utilizing **IAM Roles for Service Accounts (IRSA)**. 

The entire underlying cloud infrastructure, including the VPC, EKS Cluster, IAM Policies, and DynamoDB tables, is provisioned using Infrastructure as Code (IaC) via **Terraform**.

## 🏗️ Architecture & Tech Stack
* **Application:** Node.js, Express.js, AWS SDK v3
* **Containerization:** Docker, Amazon Elastic Container Registry (ECR)
* **Orchestration:** Kubernetes (Amazon EKS)
* **Database:** Amazon DynamoDB (Pay-per-request)
* **Infrastructure as Code:** Terraform
* **Security:** AWS IAM OIDC Provider, IRSA (Least Privilege Principle)

## 📂 Directory Structure
```text
EX24/
│
├── app/                      # Node.js application source code
│   ├── Dockerfile            # Multi-stage build instructions
│   ├── package.json          # Node dependencies
│   └── server.js             # Express API routes and DynamoDB logic
│
├── kubernetes/               # Kubernetes manifests
│   ├── deployment.yaml       # Manages application pods and ECR image pulling
│   ├── service-account.yaml  # Bridges Kubernetes SA to AWS IAM Role
│   └── service.yaml          # Exposes the app via an AWS Classic Load Balancer
│
├── screenshots/              # Proof of execution and successful tests
│   ├── Screenshot (218).png
│   ├── Screenshot (220).png
│   └── ...
│
├── terraform/                # Infrastructure provisioning scripts
│   ├── .terraform.lock.hcl   # Dependency lock file
│   ├── dynamodb.tf           # Provisions the "Customers" table
│   ├── eks.tf                # Provisions the VPC, subnets, and EKS Control Plane
│   ├── iam.tf                # Base IAM roles for EKS and Node Groups
│   ├── irsa.tf               # OIDC provider and Trust Policies for Pod database access
│   ├── main.tf               # Terraform initialization
│   ├── provider.tf           # AWS provider configuration
│   └── variables.tf          # Configurable deployment variables
│
└── README.md                 # Project documentation
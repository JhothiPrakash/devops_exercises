# Exercise 16 – Production EKS Platform Using Terraform & Terragrunt

## Objective

Build a production-ready Amazon EKS platform using Terraform and Terragrunt.

Requirements:

* EKS Cluster
* Managed Node Groups
* Dev Namespace
* Prod Namespace
* Metrics Server
* Cluster Autoscaler
* Validation using kubectl

---

# Architecture

Terraform
↓
Terragrunt
↓
AWS EKS
↓
Managed Node Groups
↓
Kubernetes Cluster
↓
Namespaces (Dev / Prod)
↓
Metrics Server
↓
Cluster Autoscaler

---

# Project Structure

```text
16-production-eks-platform
│
├── README.md
├── commands.md
├── theory.md
│
├── live
│   ├── dev
│   │   └── terragrunt.hcl
│   │
│   └── prod
│       └── terragrunt.hcl
│
├── modules
│   └── eks
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── screenshots
```

---

# Tools Used

* AWS
* Terraform
* Terragrunt
* Kubernetes
* Amazon EKS
* Helm
* Metrics Server

---

# AWS Information

Region:

```text
us-east-1
```

AWS Account:

```text
181640953339
```

Default VPC:

```text
vpc-0f906db2d46689ec5
```

Subnets Used:

```text
subnet-0f5224d2f9f1b5947
subnet-0bfa58fb8df871516
subnet-0bfb392e5805c4862
subnet-0724b0dace0fae546
subnet-0b806b8b73fb82a07
```

---

# Step 1 – Verify AWS Access

```bash
aws sts get-caller-identity
```

Output:

```text
Account: 181640953339
User: devops
```

---

# Step 2 – Create Project Structure

```bash
mkdir -p 16-production-eks-platform/live/dev
mkdir -p 16-production-eks-platform/live/prod
mkdir -p 16-production-eks-platform/modules/eks
mkdir -p 16-production-eks-platform/screenshots
```

---

# Step 3 – Create Terraform Module

Files:

```text
modules/eks/main.tf
modules/eks/variables.tf
modules/eks/outputs.tf
```

Purpose:

* Create EKS Cluster
* Create Managed Node Group
* Create IAM Resources
* Create Security Groups

---

# Step 4 – Create Terragrunt Configuration

Files:

```text
live/dev/terragrunt.hcl
live/prod/terragrunt.hcl
```

Purpose:

* Environment-specific configuration
* Reuse Terraform module

---

# Step 5 – Initialize Terraform

```bash
terragrunt init
```

Purpose:

* Download providers
* Download EKS module
* Initialize backend

Result:

```text
Terraform initialized successfully
```

---

# Step 6 – Validate Configuration

```bash
terragrunt validate
```

Result:

```text
Success! The configuration is valid.
```

---

# Step 7 – Terraform Plan

```bash
terragrunt plan
```

Result:

```text
Plan: 37 to add, 0 to change, 0 to destroy
```

---

# Step 8 – EKS Creation Failure Investigation

Issue:

```text
UnsupportedAvailabilityZoneException
```

Cause:

```text
Subnet in us-east-1e
```

Bad Subnet:

```text
subnet-08a0dcfc2aec0098b
```

Root Cause:

EKS Control Plane does not support us-east-1e.

Fix:

Remove unsupported subnet from Terragrunt configuration.

Learning:

Always validate subnet availability zones before EKS creation.

---

# Step 9 – Successful EKS Creation

```bash
terragrunt apply
```

Resources Created:

* EKS Cluster
* IAM Roles
* Security Groups
* CloudWatch Logs
* KMS Key
* Managed Node Group

Cluster Name:

```text
dev-eks-cluster
```

---

# Step 10 – Endpoint Connectivity Issue

Issue:

```text
kubectl get nodes

i/o timeout
```

Investigation:

```bash
aws eks describe-cluster
```

Found:

```text
endpointPublicAccess=false
endpointPrivateAccess=true
```

Root Cause:

Private-only EKS API endpoint.

Fix:

```hcl
cluster_endpoint_public_access  = true
cluster_endpoint_private_access = true
```

Apply Changes:

```bash
terragrunt apply
```

Result:

kubectl successfully connected.

---

# Step 11 – Configure kubectl

```bash
aws eks update-kubeconfig \
--region us-east-1 \
--name dev-eks-cluster
```

Result:

```text
Added new context
```

---

# Step 12 – Verify Nodes

```bash
kubectl get nodes
```

Result:

```text
2 Worker Nodes
Ready
```

---

# Step 13 – Create Namespaces

Create Dev:

```bash
kubectl create namespace dev
```

Create Prod:

```bash
kubectl create namespace prod
```

Verify:

```bash
kubectl get ns
```

Namespaces:

```text
default
dev
prod
kube-system
```

---

# Step 14 – Install Metrics Server

Add Repository:

```bash
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server
```

Update Repository:

```bash
helm repo update
```

Install:

```bash
helm install metrics-server metrics-server/metrics-server -n kube-system
```

Result:

```text
metrics-server Running
```

---

# Step 15 – Validate Metrics Server

Command:

```bash
kubectl top nodes
```

Result:

```text
CPU Usage
Memory Usage
```

Example:

```text
ip-172-31-64-46.ec2.internal
ip-172-31-85-98.ec2.internal
```

Meaning:

Metrics Server successfully collecting node metrics.

---

# Step 16 – Cluster Autoscaler

Objective:

Automatically add/remove worker nodes based on workload.

Validation:

```bash
aws eks list-nodegroups \
--cluster-name dev-eks-cluster
```

Expected:

Managed Node Group detected.

---

# Validation Commands

Verify Nodes:

```bash
kubectl get nodes
```

Verify Namespaces:

```bash
kubectl get ns
```

Verify Metrics:

```bash
kubectl top nodes
```

---

# Screenshots Collected

1. Terraform Apply Success
2. EKS Cluster Active
3. kubectl get nodes
4. kubectl get ns
5. kubectl top nodes
6. Metrics Server Running

---

# Key Learnings

Terraform:
Infrastructure as Code tool used to provision AWS resources.

Terragrunt:
Wrapper around Terraform used to manage multiple environments and avoid code duplication.

Amazon EKS:
Managed Kubernetes service provided by AWS.

Managed Node Group:
AWS-managed EC2 worker nodes for Kubernetes.

Metrics Server:
Collects CPU and Memory metrics from Kubernetes nodes and pods.

Namespaces:
Logical isolation inside Kubernetes clusters.

Public Endpoint:
Allows kubectl access from local machine.

Private Endpoint:
Allows access only from inside the VPC.

---

# Final Outcome

Successfully built a Production EKS Platform using:

* Terraform
* Terragrunt
* AWS EKS
* Managed Node Groups
* Kubernetes Namespaces
* Metrics Server

Validation Completed:

✅ EKS Cluster

✅ Managed Node Group

✅ Dev Namespace

✅ Prod Namespace

✅ Metrics Server

✅ kubectl top nodes

✅ Terraform & Terragrunt

Exercise 16 Completed Successfully.

# Execution Commands: Exercise 21 - Production ALB Ingress Setup

## 1. PURPOSE
This document outlines the exact commands required to deploy the API, Admin, and Dashboard microservices to an AWS EKS cluster and expose them securely using an AWS Application Load Balancer (ALB) Ingress.

## 2. PREREQUISITES (Checklist before execution)
- [ ] AWS CLI v2 installed and configured (`aws configure`).
- [ ] `kubectl` installed and authenticated to your EKS cluster.
- [ ] AWS Load Balancer Controller running in the cluster.
- [ ] Active ACM SSL Certificate ARN ready to paste into `alb-ingress.yaml`.
- [ ] (Optional but recommended) ArgoCD installed for GitOps deployments.

---

## 3. STEP-BY-STEP EXECUTION

### Step 1: Deploy Microservices
First, deploy the backend deployments and services. Navigate to the root directory of this exercise and apply the manifests folder.

```bash
kubectl apply -f manifests/api-deployment.yaml
kubectl apply -f manifests/api-service.yaml
kubectl apply -f manifests/admin-deployment.yaml
kubectl apply -f manifests/admin-service.yaml
kubectl apply -f manifests/dashboard-deployment.yaml
kubectl apply -f manifests/dashboard-service.yaml
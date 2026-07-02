# Ex15

## Objective

Investigate a complete production outage caused by secret rotation and identify the root cause by analyzing every layer of the infrastructure.

---

# Scenario

At **09:00**, a new deployment completed successfully.

At **09:05**, users started receiving:

```text
HTTP 503 Service Unavailable
```

### Available Evidence

- ArgoCD → Healthy
- Pods → Running
- Ingress → Healthy
- Application Logs → Cannot connect to Redis
- Redis Logs → Authentication failed
- AWS Secrets Manager → Secret rotated at 08:55

---

# Architecture

```text
AWS Secrets Manager
        │
        ▼
External Secrets Operator
        │
        ▼
Kubernetes Secret
        │
        ▼
Payment Application
        │
        ▼
Redis
```

---

# Project Structure

```text
15-complete-production-outage
│
├── manifests
│   ├── app-configmap.yaml
│   ├── deployment.yaml
│   ├── secretstore.yaml
│   └── externalsecret.yaml
│
├── screenshots
└── README.md
```

---

# Prerequisites

- AWS Account
- Amazon EKS Cluster
- kubectl
- Helm
- AWS CLI
- External Secrets Operator

---

# Step 1 – Create EKS Cluster

```bash
eksctl create cluster \
--name outage-lab \
--region us-east-1 \
--node-type t3.small \
--nodes 2
```

Verify

```bash
kubectl get nodes
```

---

# Step 2 – Install Redis

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami

helm repo update

helm install redis bitnami/redis \
--set architecture=standalone \
--set auth.enabled=true \
--set auth.password=Redis@123 \
--set master.persistence.enabled=false
```

Verify

```bash
kubectl get pods
```

Expected

```text
redis-master-0    Running
```

---

# Step 3 – Install External Secrets Operator

```bash
helm repo add external-secrets https://charts.external-secrets.io

helm repo update

helm install external-secrets external-secrets/external-secrets \
-n external-secrets \
--create-namespace
```

Verify

```bash
kubectl get pods -n external-secrets
```

---

# Step 4 – Create Secret in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
--name redis-secret \
--secret-string '{
  "REDIS_PASSWORD":"Redis@123"
}' \
--region us-east-1
```

Verify

```bash
aws secretsmanager get-secret-value \
--secret-id redis-secret \
--region us-east-1
```

---

# Step 5 – Create AWS Credential Secret

```bash
kubectl create secret generic aws-secret \
--from-literal=access-key=<AWS_ACCESS_KEY_ID> \
--from-literal=secret-access-key=<AWS_SECRET_ACCESS_KEY>
```

Verify

```bash
kubectl get secret
```

---

# Step 6 – Create SecretStore

Apply

```bash
kubectl apply -f manifests/secretstore.yaml
```

Verify

```bash
kubectl get secretstore
```

Expected

```text
READY: True
STATUS: Valid
```

---

# Step 7 – Create ExternalSecret

Apply

```bash
kubectl apply -f manifests/externalsecret.yaml
```

Verify

```bash
kubectl get externalsecret

kubectl get secret redis-secret
```

Decode the secret

```bash
kubectl get secret redis-secret \
-o jsonpath='{.data.REDIS_PASSWORD}' | base64 -d
```

Expected

```text
Redis@123
```

---

# Step 8 – Deploy Payment Application

Apply

```bash
kubectl apply -f manifests/app-configmap.yaml

kubectl apply -f manifests/deployment.yaml
```

Verify

```bash
kubectl get pods
```

Application Logs

```bash
kubectl logs deployment/payment-service
```

Expected

```text
Starting Payment Service...
Connecting to Redis...
PONG
Redis connection successful
```

---

# Step 9 – Rotate Secret

Rotate the password in AWS Secrets Manager.

```bash
aws secretsmanager update-secret \
--secret-id redis-secret \
--secret-string '{
  "REDIS_PASSWORD":"Redis@456"
}' \
--region us-east-1
```

Wait for External Secrets synchronization.

Verify the Kubernetes Secret

```bash
kubectl get secret redis-secret \
-o jsonpath='{.data.REDIS_PASSWORD}' | base64 -d
```

Expected

```text
Redis@456
```

---

# Step 10 – Restart Application

```bash
kubectl rollout restart deployment payment-service
```

Verify

```bash
kubectl get pods
```

---

# Step 11 – Observe Failure

Check the application logs

```bash
kubectl logs deployment/payment-service
```

Observed

```text
Starting Payment Service...
Connecting to Redis...

AUTH failed: WRONGPASS invalid username-password pair or user is disabled.

NOAUTH Authentication required.

Cannot connect to Redis

HTTP 503 Service Unavailable
```

---

# Investigation

## ArgoCD

Status

```text
Healthy
```

Deployment completed successfully.

No synchronization issues were found.

---

## AWS Secrets Manager

Verify

```bash
aws secretsmanager get-secret-value \
--secret-id redis-secret \
--region us-east-1
```

Result

```text
REDIS_PASSWORD = Redis@456
```

The secret rotation completed successfully.

---

## External Secrets

Verify

```bash
kubectl get externalsecret
```

Result

```text
SecretSynced
```

Synchronization completed successfully.

---

## Kubernetes Secret

Verify

```bash
kubectl get secret redis-secret \
-o jsonpath='{.data.REDIS_PASSWORD}' | base64 -d
```

Result

```text
Redis@456
```

The Kubernetes Secret was updated successfully.

---

## Application

Logs

```text
Cannot connect to Redis

HTTP 503 Service Unavailable
```

The application is using the newly rotated password.

---

## Redis

Redis continues using its original password.

```text
Redis@123
```

The application now sends

```text
Redis@456
```

Result

```text
Authentication failed.
```

---

# Timeline

```text
08:55
AWS Secrets Manager password rotated
        │
        ▼
08:56
External Secrets synchronized
        │
        ▼
08:57
Kubernetes Secret updated
        │
        ▼
09:00
Application restarted
        │
        ▼
Application loaded Redis@456
        │
        ▼
Redis still configured with Redis@123
        │
        ▼
09:05
Redis authentication failed
        │
        ▼
Application unavailable
        │
        ▼
HTTP 503 Service Unavailable
```

---

# Root Cause

AWS Secrets Manager successfully rotated the Redis password.

External Secrets synchronized the updated password into the Kubernetes Secret, and the payment application loaded the new password after it restarted.

However, Redis continued using the original password because its configuration was never updated during the secret rotation process.

As a result:

- The application authenticated using **Redis@456**
- Redis still expected **Redis@123**

This credential mismatch caused Redis authentication failures, preventing the application from connecting to Redis and resulting in HTTP 503 responses.

---

# Immediate Fix

- Update Redis to use the rotated password.
- Restart Redis so the updated configuration is applied.
- Restart dependent applications if required.
- Verify successful Redis authentication.
- Confirm the application is serving requests normally.

---

# Long-Term Prevention

- Coordinate secret rotation across all dependent services.
- Automate password updates for both secret stores and backend services.
- Use rolling restarts for applications that load secrets only during startup.
- Validate secret rotation in a staging environment before production.
- Implement versioned secret rotation with rollback capability.
- Monitor authentication failures immediately after secret rotations.

---

# Monitoring Improvements

Create alerts for:

- Redis authentication failures
- HTTP 503 response rate
- External Secret synchronization failures
- Secret rotation failures
- Application connection failures

Create dashboards showing:

- External Secret synchronization status
- Redis authentication metrics
- HTTP 5xx error rate
- Application health
- Secret rotation history

---

# Learning Outcomes

- Deployed Redis with authentication.
- Integrated AWS Secrets Manager with Kubernetes using External Secrets.
- Automatically synchronized Kubernetes Secrets.
- Simulated a production secret rotation.
- Investigated Redis authentication failures.
- Performed end-to-end Root Cause Analysis (RCA).
- Practiced a production troubleshooting workflow.

---

# Result

Exercise 15 completed successfully.

A production outage caused by Redis authentication failure after AWS Secrets Manager secret rotation was successfully reproduced, investigated, and resolved through end-to-end Root Cause Analysis.
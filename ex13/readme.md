# ex13

## Overview

In modern cloud-native applications, secrets such as database passwords, API keys, authentication tokens, and certificates should never be hardcoded inside application code or container images. Instead, they are stored securely using Kubernetes Secrets or external secret management systems like AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault.

Organizations periodically rotate secrets to reduce the risk of credential compromise. However, many production incidents occur because applications continue using old credentials after the secret has been rotated.

This project simulates one of those real-world incidents.

A payment service reads an API token from a Kubernetes Secret during startup. The secret is later rotated, but the running pods are not restarted immediately. As a result, the application continues using the old token, causing authentication failures until the deployment is restarted.

This exercise demonstrates how Kubernetes Secrets behave, why secret rotation can cause outages, and how to investigate and recover from the issue.

---

## Objectives

After completing this project, you will understand how to:

- Create and manage Kubernetes Secrets  
- Inject Secrets into containers as environment variables  
- Deploy applications using Kubernetes Deployments  
- Simulate secret rotation  
- Investigate authentication failures  
- Identify why updated Secrets are not immediately reflected inside running Pods  
- Recover applications using a Rolling Restart  
- Perform structured Kubernetes incident response  

---

## Real-World Scenario

Your company follows a security policy that automatically rotates API tokens every 30 days.

Yesterday, the security team rotated the payment service authentication token.

Soon after the rotation, customers began reporting payment failures.

Monitoring dashboards showed an increase in HTTP 401 Unauthorized responses.

Application logs indicated repeated authentication failures.

During the investigation, engineers discovered that the Kubernetes Secret contained the new token, but the running application Pods were still using the previous value.

Your responsibility as the DevOps Engineer is to identify the root cause, restore the service, and document the incident.

---

## Architecture

```text
Client
   │
   ▼
Payment Service
   │
   ▼
Kubernetes Deployment
   │
   ▼
Environment Variable
   │
   ▼
Kubernetes Secret
   │
   ▼
(Secret Rotation)
```

---

## Technologies Used

- Kubernetes  
- Minikube  
- Docker  
- Python  
- Flask  
- kubectl  
- Linux  

---

## Prerequisites

Before starting this project, you should understand:

- Kubernetes Pods  
- Deployments  
- Services  
- Secrets  
- Docker Images  
- Basic Linux Commands  
- kubectl  
- Python (Basic)  

---

## Project Structure

```text
exercise-13-secret-rotation-outage/

├── app/
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── secret.yaml
│
├── docs/
│
├── README.md
└── commands.md
```

---

## Project Workflow

### Phase 1 – Build the Application

A simple Flask payment service was created.

The application reads an API token from a Kubernetes Secret during startup.

```text
API_TOKEN = payment123
```

---

### Phase 2 – Deploy to Kubernetes

- Application containerized using Docker  
- Image built inside Minikube Docker environment  
- Kubernetes Secret stores API token  
- Deployment injects Secret as environment variable  
- Service exposes application  
- Tested using curl  

---

### Phase 3 – Simulate Secret Rotation

Old Token:

```text
payment123
```

New Token:

```text
payment456
```

Pods were NOT restarted after rotation.

---

## Incident Symptoms

After rotation:

- New token → `401 Unauthorized`
- Old token → Works correctly

---

## Investigation

### Step 1 – Check Logs

Application shows authentication failures.

---

### Step 2 – Check Secret

```bash
kubectl get secret payment-secret \
-o jsonpath="{.data.API_TOKEN}" | base64 -d
```

Result:

```text
payment456
```

Secret updated successfully.

---

### Step 3 – Check Pods

Pods still using old environment variables.

---

### Step 4 – Confirm Behavior

New token fails:

```text
payment456 → Unauthorized
```

Old token works:

```text
payment123 → Success
```

---

## Root Cause Analysis

Kubernetes Secrets injected as environment variables are loaded only at container startup.

Updating a Secret does NOT update running containers.

Since Pods were not restarted after rotation, they continued using the old token.

---

## Resolution

```bash
kubectl rollout restart deployment payment-service
```

New Pods loaded updated Secret successfully.

---

## Lessons Learned

- Secrets are not auto-refreshed in running Pods  
- Environment variables are static after startup  
- Rolling restart is required after secret rotation  
- Always verify both Secret + running Pods during incidents  
- Kubernetes behavior can cause production authentication issues  

---

## Key Takeaways

Updating a Kubernetes Secret does NOT update running applications automatically.

Applications must be restarted to pick up new values.

---

## Cleanup

```bash
kubectl delete deployment payment-service
kubectl delete service payment-service
kubectl delete secret payment-secret
minikube stop
minikube delete
```

---

## Conclusion

This project simulated a real production incident caused by Kubernetes Secret rotation.

It demonstrated how improper handling of secret updates can lead to authentication failures and how rolling restarts resolve the issue.
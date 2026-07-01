# Ex4

## Objective

Implement External Secrets Operator with AWS Secrets Manager and investigate a production incident caused by an IAM permission failure.

---

# INCIDENT

Application startup failed:

```text
FATAL:
Database password not found

Environment Variable DB_PASSWORD missing

External Secret Status:
READY=False

Error:
SecretSyncedError

AccessDeniedException:
User is not authorized to perform:
secretsmanager:GetSecretValue
```

---

# ARCHITECTURE

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
Application Pod
```

---

# ENVIRONMENT

- AWS EKS
- AWS Secrets Manager
- External Secrets Operator (ESO)
- IAM Roles for Service Accounts (IRSA)
- Kubernetes
- Helm

---

# PROJECT STRUCTURE

```text
04-external-secrets-failure/
├── docs
├── manifests
│   ├── clustersecretstore.yaml
│   ├── externalsecret.yaml
│   ├── app.yaml
│   └── secret-policy.json
└── screenshots
```

---

# Step 1: Create EKS Cluster

```bash
eksctl create cluster \
--name external-secrets-lab \
--region us-east-1 \
--nodegroup-name workers \
--nodes 2 \
--node-type t3.small
```

Verify:

```bash
kubectl get nodes
```

---

# Step 2: Install External Secrets Operator

```bash
helm repo add external-secrets https://charts.external-secrets.io

helm repo update

helm install external-secrets \
external-secrets/external-secrets \
-n external-secrets-system \
--create-namespace
```

Verify:

```bash
kubectl get pods -n external-secrets-system
```

---

# Step 3: Create Secret in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
--name db-password \
--secret-string '{"password":"SuperSecret123"}' \
--region us-east-1
```

Verify:

```bash
aws secretsmanager get-secret-value \
--secret-id db-password \
--region us-east-1
```

---

# Step 4: Create IAM Policy

Create **manifests/secret-policy.json**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

Create the policy:

```bash
aws iam create-policy \
--policy-name ExternalSecretsPolicy \
--policy-document file://manifests/secret-policy.json
```

---

# Step 5: Configure OIDC

```bash
eksctl utils associate-iam-oidc-provider \
--cluster external-secrets-lab \
--region us-east-1 \
--approve
```

---

# Step 6: Create IRSA

```bash
eksctl create iamserviceaccount \
--name external-secrets-sa \
--namespace external-secrets-system \
--cluster external-secrets-lab \
--attach-policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/ExternalSecretsPolicy \
--approve \
--override-existing-serviceaccounts
```

Restart ESO:

```bash
kubectl rollout restart deployment external-secrets \
-n external-secrets-system
```

---

# Step 7: Create ClusterSecretStore

Create **manifests/clustersecretstore.yaml**

```yaml
apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: aws-secretsmanager

spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
            namespace: external-secrets-system
```

Apply:

```bash
kubectl apply -f manifests/clustersecretstore.yaml
```

---

# Step 8: Create ExternalSecret

Create **manifests/externalsecret.yaml**

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret

metadata:
  name: db-password

spec:
  refreshInterval: 1m

  secretStoreRef:
    name: aws-secretsmanager
    kind: ClusterSecretStore

  target:
    name: db-secret

  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: db-password
        property: password
```

Apply:

```bash
kubectl apply -f manifests/externalsecret.yaml
```

Verify:

```bash
kubectl get externalsecret
```

Expected:

```text
READY=True
```

---

# Step 9: Verify Secret

```bash
kubectl get secret db-secret
```

Decode:

```bash
kubectl get secret db-secret \
-o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

Expected:

```text
SuperSecret123
```

---

# Step 10: Deploy Test Application

Create **manifests/app.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: secret-app

spec:
  replicas: 1

  selector:
    matchLabels:
      app: secret-app

  template:
    metadata:
      labels:
        app: secret-app

    spec:
      containers:
        - name: app
          image: busybox

          command:
            - sh
            - -c
            - |
              echo "DB_PASSWORD=$DB_PASSWORD";
              sleep 3600

          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: DB_PASSWORD
```

Apply:

```bash
kubectl apply -f manifests/app.yaml
```

Verify:

```bash
kubectl logs deployment/secret-app
```

Expected Output:

```text
DB_PASSWORD=SuperSecret123
```

---

# Step 11: Create Incident

Detach the IAM policy:

```bash
aws iam detach-role-policy \
--role-name <ROLE_NAME> \
--policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/ExternalSecretsPolicy
```

Restart External Secrets Operator:

```bash
kubectl rollout restart deployment external-secrets \
-n external-secrets-system
```

---

# Symptoms

```bash
kubectl get externalsecret
```

Output:

```text
READY=False
```

Describe:

```bash
kubectl describe externalsecret db-password
```

Expected Output:

```text
SecretSyncedError

AccessDeniedException

User is not authorized to perform:
secretsmanager:GetSecretValue
```

---

# Investigation

## AWS Issue

IAM role lost permission:

```text
secretsmanager:GetSecretValue
```

Evidence:

```text
AccessDeniedException
```

---

## Kubernetes Issue

No issue found.

Verified:

- ClusterSecretStore is valid
- ExternalSecret exists
- ServiceAccount exists
- IRSA configured

---

## Secret Issue

No issue found.

Verified:

- Secret exists in AWS Secrets Manager
- Secret value is valid

---

# Root Cause

The IAM policy granting:

```text
secretsmanager:GetSecretValue
```

was detached from the IRSA role used by External Secrets Operator.

As a result:

- ExternalSecret could not sync secrets from AWS Secrets Manager.
- Kubernetes Secret was not created or updated.
- Applications depending on `DB_PASSWORD` failed to start.

---

# Resolution

Reattach the IAM policy:

```bash
aws iam attach-role-policy \
--role-name <ROLE_NAME> \
--policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/ExternalSecretsPolicy
```

Restart ESO:

```bash
kubectl rollout restart deployment external-secrets \
-n external-secrets-system
```

Verify:

```bash
kubectl get externalsecret
```

Expected:

```text
READY=True
```

---

# Prevention

- Follow least-privilege IAM policies.
- Monitor IAM policy changes.
- Enable AWS CloudTrail alerts.
- Use Infrastructure as Code (Terraform).
- Implement approval workflows for IAM changes.
- Monitor ExternalSecret health.

---

# Outcome

Successfully reproduced and resolved a production-grade External Secrets failure.

## Skills Demonstrated

- AWS Secrets Manager
- External Secrets Operator (ESO)
- Kubernetes Secret Management
- IAM Policies
- IAM Roles for Service Accounts (IRSA)
- OIDC
- Incident Investigation
- Root Cause Analysis
- Production Troubleshooting

---

# Exercise 4 Completed Successfully
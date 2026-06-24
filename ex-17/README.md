# 🚀 Exercise 17: Implementing IRSA on AWS EKS

## 📌 Objective
The goal of this practical assessment is to implement **IAM Roles for Service Accounts (IRSA)**. This allows an application running inside an Amazon EKS cluster to securely interact with an AWS DynamoDB table without hardcoding any AWS access keys inside the container or code.

## 🏗️ Architecture & Tech Stack
* **Cloud Provider:** AWS
* **Compute:** Amazon EKS (Elastic Kubernetes Service), EC2 Managed Nodes
* **Database:** Amazon DynamoDB
* **Security:** AWS IAM, OIDC (OpenID Connect), Kubernetes Service Accounts
* **Tools Used:** `eksctl`, `kubectl`, AWS CLI, Git Bash

## ⚙️ Step-by-Step Implementation

1. **Infrastructure Provisioning:**
   * Spun up a managed EKS cluster (`irsa-demo-cluster`) in `us-east-1` using `eksctl`.
   * Created a DynamoDB table (`IRSADemoTable`) with a primary key schema.

2. **OIDC & IAM Trust Configuration:**
   * Associated an IAM OIDC provider with the EKS cluster to bridge Kubernetes authentication with AWS IAM.
   * Created a custom IAM Policy (`dynamodb-policy.json`) strictly scoped to allow `GetItem`, `PutItem`, and `UpdateItem` operations only on the designated DynamoDB table.

3. **Service Account Binding:**
   * Created an IAM Role and linked it to a Kubernetes Service Account (`dynamodb-sa`) in the `default` namespace. 

4. **Pod Deployment & Verification:**
   * Deployed a test pod running the AWS CLI image, explicitly assigning it the `dynamodb-sa` service account.
   * Executed a full database CRUD test (Put, Update, Get) securely from within the pod.

---

## 📸 Proof of Completion

### 1. EKS Cluster Provisioning
The successful creation and readiness of the EKS control plane and managed node groups.
![EKS Cluster Creation](images/task17-cluster.png)

### 2. Secure Database Access (Final Verification)
Output proving the pod successfully wrote and updated data in DynamoDB using temporary IRSA credentials.
![DynamoDB Output](images/task17-op.png)

---

*Note: All cloud resources were cleanly terminated post-verification to adhere to cost-optimization practices.*
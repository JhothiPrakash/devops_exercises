# AWS EKS ALB Ingress Troubleshooting Incident

## 📌 Objective
Investigate and resolve a simulated Application Load Balancer (ALB) Ingress failure within an Amazon Elastic Kubernetes Service (EKS) environment.

## 🛠️ Technology Stack
* **Cloud Provider:** AWS (EKS, VPC, EC2, IAM, ELB)
* **Container Orchestration:** Kubernetes
* **Networking:** AWS Load Balancer Controller, Ingress, OIDC, IRSA
* **Web Server:** Nginx

## 🚨 Incident Summary
Users reported that a newly deployed web application was inaccessible from the internet. 
* **Observed Symptoms:** 504 Gateway Timeout, empty Ingress address, and target registration failures.
* **Initial Investigation:** The Kubernetes Deployment and Service were healthy, isolating the failure to the external routing layer.

## 🔍 Root Cause Analysis
By querying the `kube-system` namespace logs (`kubectl logs deployment/aws-load-balancer-controller`), the underlying failure was identified:

1. **Missing Subnet Tags (Simulated):** The AWS Load Balancer Controller requires specific tags (e.g., `kubernetes.io/role/elb=1`) on VPC subnets to auto-discover where to place the physical ALB. Without these, the controller throws a `couldn't auto-discover subnets` error.
2. **Protocol Mismatch:** External traffic was attempting to reach the provisioned ALB over port 443 (HTTPS), but the Ingress resource was strictly configured to listen on port 80 (HTTP) without TLS termination.

## ✅ Resolution & Remediation
* **Infrastructure Provisioning:** Utilized `eksctl` to provision an EKS cluster, which modernly automates correct VPC subnet tagging during the CloudFormation build phase.
* **Controller Authentication:** Associated an IAM OIDC provider and configured IAM Roles for Service Accounts (IRSA) to grant the controller necessary AWS API permissions.
* **Helm Deployment:** Deployed the AWS Load Balancer Controller using Helm charts.
* **Traffic Routing:** Corrected the client-side protocol request from `https://` to `http://`, successfully establishing a connection to the internal Nginx pods.
* **Cleanup:** Systematically destroyed the cluster using Infrastructure as Code (IaC) principles to prevent orphaned resources.

## 💡 Key Takeaways
* **Log Aggregation:** System-level pods are critical for debugging cloud-provider integrations.
* **Security & IAM:** Following the principle of least privilege using IRSA ensures the cluster only has access to the load balancing resources it explicitly needs.
* **Cost Management:** Thorough resource teardown is a mandatory operational standard.
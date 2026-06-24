# EKS Cluster Deployment Execution Workflow

## 1. Deploy Development Environment
Navigate to the dev live directory and execute Terragrunt to provision the AWS infrastructure.
\`\`\`bash
cd live/dev
terragrunt init
terragrunt plan
terragrunt apply
\`\`\`

## 2. Deploy Production Environment
Navigate to the prod live directory to provision the production-grade EKS cluster.
\`\`\`bash
cd live/prod
terragrunt init
terragrunt plan
terragrunt apply
\`\`\`

## 3. Kubernetes Cluster Authentication
Update your local kubeconfig to interact with the newly created EKS clusters via kubectl.
\`\`\`bash
aws eks update-kubeconfig --region <YOUR_AWS_REGION> --name <CLUSTER_NAME>
\`\`\`

## 4. Teardown / Cleanup
To prevent ongoing AWS charges when the clusters are no longer needed.
\`\`\`bash
cd live/dev
terragrunt destroy

cd live/prod
terragrunt destroy
\`\`\`
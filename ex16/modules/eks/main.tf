provider "aws" {
  region = var.region
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.34"

  enable_cluster_creator_admin_permissions = true

  # Allow access from your laptop/WSL
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  eks_managed_node_groups = {
    default = {
      instance_types = ["t3.small"]

      min_size     = 2
      max_size     = 3
      desired_size = 2
    }
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

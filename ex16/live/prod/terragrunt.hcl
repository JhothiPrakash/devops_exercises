terraform {
  source = "../../modules/eks"
}

inputs = {
  region       = "us-east-1"
  cluster_name = "prod-eks-cluster"
  environment  = "prod"

  vpc_id = "vpc-0f906db2d46689ec5"

  subnet_ids = [
    "subnet-0f5224d2f9f1b5947",
    "subnet-0bfa58fb8df871516",
    "subnet-0bfb392e5805c4862",
    "subnet-0724b0dace0fae546",
    "subnet-0b806b8b73fb82a07",
    "subnet-08a0dcfc2aec0098b"
  ]
}

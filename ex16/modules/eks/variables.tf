variable "region" {}

variable "cluster_name" {}

variable "environment" {}

variable "vpc_id" {}

variable "subnet_ids" {
  type = list(string)
}

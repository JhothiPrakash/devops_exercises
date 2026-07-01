# Exercise 8 – Egress Restriction Incident

## Incident Summary
Application pods timed out connecting to DynamoDB after the default outbound internet rule (`0.0.0.0/0`) was removed from the EKS Node Security Group.

## Root Cause
Strict network policies blocked internet access, isolating the nodes from the public AWS API endpoints.

## Resolution
Provisioned a Gateway VPC Endpoint for DynamoDB (`com.amazonaws.ap-south-1.dynamodb`), injecting a private route directly into the VPC Route Tables. Connectivity restored securely without exposing nodes to the public internet.

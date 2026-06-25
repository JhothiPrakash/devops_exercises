# Exercise 19: Helm Chart Engineering

## Objective
Build a reusable Helm Chart that supports replicas, resources, ConfigMaps, Secrets, Ingress, and Autoscaling across Dev, QA, and Prod environments.

## Chart Structure
The `myapp-chart` directory contains the base templates and default `values.yaml`.

## How to Deploy

**1. Development Environment**
helm upgrade --install myapp-dev ./myapp-chart -f myapp-chart/values-dev.yaml

**2. QA Environment**
helm upgrade --install myapp-qa ./myapp-chart -f myapp-chart/values-qa.yaml

**3. Production Environment**
helm upgrade --install myapp-prod ./myapp-chart -f myapp-chart/values-prod.yaml
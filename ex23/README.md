# Exercise 23: Build CI/CD Pipeline

## Objective

Build an automated CI/CD pipeline that validates code quality, performs security checks, and builds a Docker image before deployment.

---

## Architecture

GitHub Push
↓
Unit Tests (Pytest)
↓
Security Scan (Trivy)
↓
Docker Build
↓
ECR Push
↓
GitOps Update
↓
ArgoCD Deploy

---

## Project Structure

```text
23-build-cicd-pipeline/
├── .github/
│   └── workflows/
│       └── cicd-pipeline.yml
├── app/
│   ├── app.py
│   ├── test_app.py
│   ├── requirements.txt
│   └── Dockerfile
├── gitops/
│   └── deployment.yaml
├── manifests/
│   └── argocd-application.yaml
├── screenshots/
├── README.md
└── commands.md
```

---

## Application

A simple Flask application was created and containerized using Docker.

### Features

* Python Flask application
* Unit testing using Pytest
* Dockerized deployment

---

## CI/CD Workflow

The GitHub Actions workflow performs the following stages:

### 1. Unit Testing

* Installs application dependencies
* Executes Pytest test cases
* Pipeline fails if any test fails

### 2. Security Scanning

* Uses Trivy security scanner
* Scans source code and dependencies
* Pipeline fails on HIGH or CRITICAL vulnerabilities

### 3. Docker Build

* Builds Docker image
* Validates containerization process

---

## Validation Results

### Unit Test

```bash
python -m pytest
```

Result:

```text
1 passed
```

### Docker Build

```bash
docker build -t cicd-demo:v1 .
```

Result:

```text
Successfully built Docker image
```

### GitHub Actions

Workflow executed successfully with:

```text
test            SUCCESS
security-scan   SUCCESS
docker-build    SUCCESS
```

---

## Security Controls

The pipeline automatically fails when:

* Unit tests fail
* High severity vulnerabilities are detected
* Critical severity vulnerabilities are detected

---

## Outcome

Successfully implemented a CI/CD pipeline using GitHub Actions with:

* Automated testing
* Security scanning
* Docker image build automation
* GitOps deployment design
* ArgoCD deployment design

Exercise Status: COMPLETED

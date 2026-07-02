# Commands Used – Kubernetes Node DiskPressure Incident Response Lab

This document contains all the commands used throughout the project.

---

## 1. Start Minikube

Start the Minikube cluster.

```bash
minikube start
```

---

## 2. Verify the Kubernetes Cluster

Check the node status.

```bash
kubectl get nodes
```

Check all pods across namespaces.

```bash
kubectl get pods -A
```

Check pods in the default namespace.

```bash
kubectl get pods
```

---

## 3. Deploy the Log Generator

Deploy the application.

```bash
kubectl apply -f spam-logger.yaml
```

Verify the deployment.

```bash
kubectl get pods
```

View the application logs.

```bash
kubectl logs -f <pod-name>
```

---

## 4. Access the Minikube Node

Connect to the Minikube virtual machine.

```bash
minikube ssh
```

---

## 5. Check Filesystem Usage

View filesystem usage.

```bash
df -h
```

---

## 6. View Kubernetes Container Log Links

List container log symlinks.

```bash
sudo ls -lh /var/log/containers/
```

---

## 7. Check Container Log Directory Size

Display the size of container logs.

```bash
sudo du -sh /var/log/containers/*
```

---

## 8. Locate the Pod Log Directory

Find the log directory for the spam logger pod.

```bash
sudo find /var/log/pods | grep spam
```

---

## 9. Inspect the Pod Log File

View the actual log file.

```bash
sudo ls -lh /var/log/pods/default_spam-logger-*/logger/0.log
```

---

## 10. Check Pod Log Directory Size

Determine the disk usage of the pod logs.

```bash
sudo du -sh /var/log/pods/default_spam-logger-*
```

---

## 11. Monitor Disk Usage (Optional)

Continuously monitor disk usage.

```bash
watch -n 2 df -h
```

---

## 12. Simulated Production Investigation

Describe the Kubernetes node.

```bash
kubectl describe node minikube
```

Check filesystem usage.

```bash
df -h
```

Find large directories.

```bash
sudo du -sh /var/*
```

Investigate log directories.

```bash
sudo du -sh /var/log/*
```

Find large container log files.

```bash
sudo du -sh /var/log/containers/*
```

---

## 13. Simulated Recovery

Scale down the application.

```bash
kubectl scale deployment spam-logger --replicas=0
```

Verify the pods.

```bash
kubectl get pods
```

Check disk usage.

```bash
df -h
```

Verify node health.

```bash
kubectl get nodes
```

```bash
kubectl describe node minikube
```

Scale the application back up.

```bash
kubectl scale deployment spam-logger --replicas=1
```

---

## 14. Cleanup

Delete the deployment.

```bash
kubectl delete deployment spam-logger
```

Exit the Minikube VM.

```bash
exit
```

Delete the Minikube cluster.

```bash
minikube delete
```

---

## 15. Optional Docker Cleanup

Remove unused Docker resources.

```bash
docker system prune -a
```

> **Warning:** This command removes all unused Docker images, stopped containers, unused networks, and build cache from your host machine.

---

## 16. Verification

Verify the cluster status.

```bash
kubectl get nodes
```

Check all resources.

```bash
kubectl get all
```

Expected output:

```text
No resources found in default namespace.
```
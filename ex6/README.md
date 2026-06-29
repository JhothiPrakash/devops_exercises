# ex6

## Objective

Investigate an application scaling failure in Amazon EKS where the Horizontal Pod Autoscaler (HPA) requests additional replicas, but pods remain pending due to insufficient node resources and Cluster Autoscaler issues.

---

## Incident

**Application failed to scale.**

### Observed

**HPA Status**

* Desired Replicas: **15**
* Current Replicas: **5**

**Pending Pods**

```text
0/3 nodes available:
Insufficient CPU
```

**Cluster Autoscaler Logs**

```text
No node group config found
```

---

## Environment

* AWS EKS
* Kubernetes
* Horizontal Pod Autoscaler (HPA)
* Metrics Server
* Cluster Autoscaler
* Nginx Test Application

---

## Project Structure

```text
06-eks-node-scale-failure/
├── manifests
│   └── stress-app.yaml
├── screenshots
└── README.md
```

---

## Architecture

```text
User Traffic
      │
      ▼
Application Deployment
      │
      ▼
Horizontal Pod Autoscaler (HPA)
      │
      ▼
Kubernetes Scheduler
      │
      ▼
Worker Nodes
      │
      ▼
Cluster Autoscaler
```

---

## Create Test Application

Create a deployment with high CPU requests.

**File:** `manifests/stress-app.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: stress-app

spec:
  replicas: 5

  selector:
    matchLabels:
      app: stress-app

  template:
    metadata:
      labels:
        app: stress-app

    spec:
      containers:
        - name: stress-app
          image: nginx

          resources:
            requests:
              cpu: "1000m"
            limits:
              cpu: "1000m"
```

Apply the deployment:

```bash
kubectl apply -f manifests/stress-app.yaml
```

---

## Observe Pod Scheduling Failure

Check the pods:

```bash
kubectl get pods
```

Example output:

```text
Running
Running
Pending
Pending
Pending
```

Several pods remained in the **Pending** state.

---

## Investigate Pending Pods

Describe a pending pod:

```bash
kubectl describe pod <pending-pod>
```

Example events:

```text
FailedScheduling

0/2 nodes are available:

Insufficient cpu

No preemption victims found
```

This confirms that the Kubernetes scheduler could not place the pod because worker nodes lacked available CPU resources.

---

## Check Node Utilization

View node metrics:

```bash
kubectl top nodes
```

Example output:

```text
CPU Usage: 1%
Memory Usage: 33%
```

Although CPU utilization was low, scheduling still failed.

---

## Check Resource Allocation

View allocated resources:

```bash
kubectl describe nodes | grep -A5 "Allocated resources"
```

Example output:

```text
Node 1:
CPU Requests = 64%

Node 2:
CPU Requests = 75%
```

Pods requested large CPU reservations:

```yaml
cpu: "1000m"
```

Kubernetes schedules pods based on **requested resources**, not actual CPU usage.

---

## Create Horizontal Pod Autoscaler

Create the HPA:

```bash
kubectl autoscale deployment stress-app \
  --cpu-percent=50 \
  --min=5 \
  --max=15
```

Verify:

```bash
kubectl get hpa
```

Example output:

```text
NAME         REFERENCE                 TARGETS
stress-app   Deployment/stress-app

MINPODS = 5
MAXPODS = 15
```

---

# Investigation

## HPA Issue

**Result:** ❌ No

### Evidence

* HPA was created successfully.
* Minimum replicas configured.
* Maximum replicas configured.
* Scaling configuration was valid.

**Conclusion**

The HPA configuration was **not** the cause of the incident.

---

## Node Issue

**Result:** ✅ Yes

### Evidence

```text
FailedScheduling

0/2 nodes available:

Insufficient cpu
```

Pods could not be scheduled because worker nodes lacked sufficient CPU capacity.

**Conclusion**

Node capacity was exhausted.

---

## Cluster Autoscaler Issue

**Result:** ✅ Yes

### Evidence

No additional worker nodes were created despite pending pods.

Example Cluster Autoscaler log:

```text
No node group config found
```

Possible causes:

* Cluster Autoscaler not installed
* Node group auto-discovery not configured
* Incorrect IAM permissions
* Invalid autoscaler configuration

**Conclusion**

The Cluster Autoscaler could not provision new worker nodes.

---

# Root Cause

The Horizontal Pod Autoscaler requested additional replicas.

The Kubernetes scheduler attempted to place the new pods.

Worker nodes did not have sufficient CPU resources to satisfy pod requests.

The Cluster Autoscaler failed to add new worker nodes because the node group configuration was missing or invalid.

### Result

* Desired Replicas: **15**
* Current Replicas: **5**
* Pending Pods
* Insufficient CPU

The application could not scale.

---

# Resolution

1. Increase the node group size.
2. Configure the Cluster Autoscaler correctly.
3. Enable node group auto-discovery.
4. Validate IAM permissions.
5. Reduce excessive CPU requests where appropriate.
6. Monitor cluster capacity proactively.

---

# Prevention

* Configure Cluster Autoscaler for all node groups.
* Enable autoscaler monitoring and alerting.
* Review CPU requests before deployment.
* Implement capacity planning.
* Monitor pending pods continuously.
* Validate HPA and Cluster Autoscaler integration during testing.

---

# Outcome

Successfully reproduced and investigated an Amazon EKS scaling failure.

## Skills Demonstrated

* Amazon EKS
* Kubernetes Scheduling
* Horizontal Pod Autoscaler (HPA)
* Cluster Capacity Analysis
* Resource Requests and Limits
* Pending Pod Troubleshooting
* Cluster Autoscaler Investigation
* Root Cause Analysis
* Production Incident Response

---

**Exercise 6 Completed Successfully.**

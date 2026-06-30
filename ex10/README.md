# Exercise 10 – Loki Logging Failure

## Objective
Investigate and resolve a logging pipeline failure where application logs stopped appearing in Grafana.

## Failure Point
Promtail → Loki (Connection Refused)

## Root Cause Analysis
The Loki service was scaled to zero replicas, making it unavailable. Promtail could not push logs to the Loki API, resulting in "connection refused" errors.

## Resolution
Scaled the Loki statefulset back to 1 replica:
```bash
kubectl scale statefulset loki -n monitoring --replicas=1
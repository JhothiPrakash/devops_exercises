# ex13

This file contains all the commands used during the project from setup to cleanup.

---

## 1. Start Minikube

Start Minikube

```bash
minikube start
```

Verify the cluster

```bash
kubectl get nodes
```

---

## 2. Create Project

```bash
mkdir exercise-13-secret-rotation-outage

cd exercise-13-secret-rotation-outage
```

---

## 3. Create Application

```bash
mkdir app

cd app

touch app.py requirements.txt Dockerfile
```

---

## 4. Build Docker Image

Switch Docker daemon to Minikube

```bash
eval $(minikube docker-env)
```

Build the image

```bash
docker build -t payment-service:v1 .
```

Verify the image

```bash
docker images
```

---

## 5. Create Kubernetes Manifests

```bash
cd ..

mkdir k8s

cd k8s

touch deployment.yaml
touch service.yaml
touch secret.yaml
```

---

## 6. Deploy Application

Create the Secret

```bash
kubectl apply -f secret.yaml
```

Create the Deployment

```bash
kubectl apply -f deployment.yaml
```

Create the Service

```bash
kubectl apply -f service.yaml
```

---

## 7. Verify Resources

Pods

```bash
kubectl get pods
```

Deployments

```bash
kubectl get deployments
```

Services

```bash
kubectl get svc
```

Secrets

```bash
kubectl get secret
```

---

## 8. Port Forward

```bash
kubectl port-forward svc/payment-service 8082:80
```

---

## 9. Test Application

Home Page

```bash
curl http://localhost:8082/
```

Wrong Token

```bash
curl -H "Authorization: wrongtoken" http://localhost:8082/payment
```

Correct Token

```bash
curl -H "Authorization: payment123" http://localhost:8082/payment
```

---

## 10. Verify Secret

View Secret

```bash
kubectl get secret payment-secret -o yaml
```

Decode Secret

```bash
kubectl get secret payment-secret -o jsonpath="{.data.API_TOKEN}" | base64 -d
```

---

## 11. Rotate Secret

Generate Base64

```bash
echo -n "payment456" | base64
```

Edit the Kubernetes Secret

```bash
kubectl edit secret payment-secret
```

Or modify `secret.yaml`

```yaml
stringData:
  API_TOKEN: payment456
```

Apply the updated Secret

```bash
kubectl apply -f secret.yaml
```

Verify the Secret

```bash
kubectl get secret payment-secret -o jsonpath="{.data.API_TOKEN}" | base64 -d
```

---

## 12. Simulate Incident

Test using the new token

```bash
curl -H "Authorization: payment456" http://localhost:8082/payment
```

Test using the old token

```bash
curl -H "Authorization: payment123" http://localhost:8082/payment
```

Expected Result

- New token → Unauthorized
- Old token → Payment Successful

---

## 13. Investigate Incident

Application Logs

```bash
kubectl logs -l app=payment-service
```

Verify Secret

```bash
kubectl get secret payment-secret -o jsonpath="{.data.API_TOKEN}" | base64 -d
```

Check Pods

```bash
kubectl get pods
```

Describe Deployment

```bash
kubectl describe deployment payment-service
```

Check Environment Variable Inside the Pod

```bash
kubectl exec -it <pod-name> -- printenv | grep API_TOKEN
```

Example

```bash
kubectl exec -it payment-service-6478c7db78-bhrlx -- printenv | grep API_TOKEN
```

---

## 14. Recover Service

Restart the Deployment

```bash
kubectl rollout restart deployment payment-service
```

Monitor the rollout

```bash
kubectl rollout status deployment payment-service
```

Restart Port Forward

```bash
kubectl port-forward svc/payment-service 8082:80
```

Verify

```bash
curl -H "Authorization: payment456" http://localhost:8082/payment
```

```bash
curl -H "Authorization: payment123" http://localhost:8082/payment
```

Expected Result

- payment456 → Payment Successful
- payment123 → Unauthorized

---

## 15. Useful Debugging Commands

List all resources

```bash
kubectl get all
```

Describe Pod

```bash
kubectl describe pod <pod-name>
```

View Pod Logs

```bash
kubectl logs <pod-name>
```

Open a shell inside the Pod

```bash
kubectl exec -it <pod-name> -- sh
```

View Environment Variables

```bash
printenv
```

View Secret

```bash
kubectl get secret payment-secret -o yaml
```

Decode Secret

```bash
kubectl get secret payment-secret -o jsonpath="{.data.API_TOKEN}" | base64 -d
```

---

## 16. Cleanup

Delete Deployment

```bash
kubectl delete deployment payment-service
```

Delete Service

```bash
kubectl delete service payment-service
```

Delete Secret

```bash
kubectl delete secret payment-secret
```

Delete all resources

```bash
kubectl delete all --all
```

Stop Minikube

```bash
minikube stop
```

Delete the Minikube cluster

```bash
minikube delete
```
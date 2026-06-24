# Exercise 22: Horizontal and Cluster Autoscaling Execution

## 1. Deploy the Application and Service
kubectl apply -f manifests/nginx-deployment.yaml
kubectl apply -f manifests/nginx-service.yaml

## 2. Deploy Database Test Component
kubectl apply -f manifests/dynamodb-test.yaml

## 3. Configure Horizontal Pod Autoscaler (HPA)
kubectl apply -f manifests/hpa.yaml

## 4. Configure Cluster Autoscaler
kubectl apply -f manifests/cluster-autoscaler-rbac.yaml
kubectl apply -f manifests/cluster-autoscaler.yaml

## 5. Generate Load to Trigger Scaling
kubectl apply -f manifests/stress-deployment.yaml

## 6. Monitor Autoscaling in Real-Time
kubectl get hpa -w
kubectl get pods -w
kubectl get nodes -w

## 7. Clean Up Resources
kubectl delete -f manifests/
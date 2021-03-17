# Publish to kubernetes
Publish to kubernetes by creating resources under dev folder

```bash
 CLUSTER='hero-datacenter'
 NAMESPACE='hero-dev'
 kubectl create namespace hero-dev
 kubectl create -f ./deploy/dev/
 kubectl get services,deployments,pods

 # update deployment image
 kubectl set image deployment/eventsarchive grpc=nexus.internal.hero.com/hero/eventsarchive
 kubectl set image deployment/eventsarchive rest=nexus.internal.hero.com/hero/eventsarchive
```

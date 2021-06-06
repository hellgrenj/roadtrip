
# roadtrip

## demo

This is a demo of [Kubernetes Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) (HPA) on docker-desktop. You can start the target system with one command and you have two  scripts prepared, one for generating load and one that monitors the status of your deployment.

**The target system**   
A simple HTTP API where you can post a list of capitals and get an itinerary back including an optimal route.   
```
              |---------------------|
              | api (.net 5 web api)|
              | --------------------|
                /                  \
               /                    \
              /                      \
  |-------------------------|     |------------------------------------------|
  |  location               |     |  route                                   |
  |  (.net 5 route-2-code)  |     |  (golang)                                |
  |   looks up gps          |     |  calculates optimal route                |
  |   coordinates           |     |  based on distance (travelling salesman) |
  |   for capitals          |     |  THE TARGET OF OUR SCALING EXERCISE! =)  |
  |-------------------------|     |------------------------------------------|               
```


## prerequisites

**to run**  
* docker desktop (v 3.3.1 or later) with kubernetes (v 1.19 or later) enabled    
* [skaffold](https://skaffold.dev/)  
* [deno](https://deno.land/) version 1.9.x  ❤️   

**to develop (in addition)**  
* .net 5  
* go 1.15 or later  

## preparations

In order to use HPA you need [metrics-server](https://github.com/kubernetes-sigs/metrics-server) in your cluster.    
1) First install metrics-server:    
```kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.4.2/components.yaml```     
(check if there is a later version than v0.4.2 and use that instead..)  

2) Then add the --kubelet-insecure-tls argument to the metrics-server deployment (**in dev env only!**)    
``` kubectl patch deployment metrics-server -n kube-system --type 'json' -p '[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]' ```  



## run

In the project folder root:    
1) run ```skaffold run``` in one terminal window/tab    
1.1) (**first time only**) install the HPA by running ```kubectl autoscale deployment route --cpu-percent=50 --min=1 --max=10```   
2) run ```deno run --allow-run ./loadgenerator/cluster-status.ts``` in one terminal window/tab (this will monitor your deployment..)    
3) run ```deno run --allow-net --unstable ./loadgenerator/run.ts``` in one terminal window/tab (this will generate load with a slow ramp up...)  


## run with Nginx Ingress and Metallb
1) First: run ```skaffold run``` and then follow the steps in the readme in folder **metallb-test**   
2) Then start the scripts with arg **metallb** (and allow ./loadgenerator/run.ts the *run-permission*):  
2.1) run ```deno run --allow-run ./loadgenerator/cluster-status.ts metallb``` in one terminal window/tab (this will monitor your deployment..)  
2.2) run ```deno run --allow-run --allow-net --unstable  ./loadgenerator/run.ts metallb``` in one terminal window/tab (this will generate load with a slow ramp up...)  
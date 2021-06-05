# Setup Metallb and Nginx Ingress in k8s on docker-desktop
This guide assumes you have roadtrip up and running (see readme in root)

## Install Nginx Ingress Controller
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.46.0/deploy/static/provider/cloud/deploy.yaml
```   
(from docs: https://kubernetes.github.io/ingress-nginx/deploy/#docker-desktop)
  
## Install Metallb
1) Follow the **Preperation** guide here: https://metallb.universe.tf/installation/
2) Run the following commands (also from above guide) in order:

```
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.6/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.6/manifests/metallb.yaml
# On first install only
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
```

## Apply the Metallb config
run ```kubectl apply -f metallb-config.yaml```

## Apply the Ingress
run ```kubectl apply -f ingress.yaml```

## Verify Nginx ingress external IP 
run ```kubectl get ingress```  

expected output
```
NAME           CLASS    HOSTS                  ADDRESS       PORTS   AGE
main-ingress   <none>   testhost.roadtrip.se   127.0.0.2XX   80      XXh
```

## Query the API
use curl and send host header expected by nginx ingress

``` 
curl -H 'Host:testhost.roadtrip.se' \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"places": ["stockholm", "nairobi","madrid","canberra","london"]}' \
   http://127.0.0.243/itinerary
```

expected response

```
{"stops":[{"id":"Stockholm","name":"Stockholm","lat":59.333333333333336,"long":18.05,"routeStop":0},{"id":"Canberra","name":"Canberra","lat":-35.266666666666666,"long":149.133333,"routeStop":1},{"id":"Nairobi","name":"Nairobi","lat":-1.2833333333333332,"long":36.816667,"routeStop":2},{"id":"Madrid","name":"Madrid","lat":40.4,"long":-3.683333,"routeStop":3},{"id":"London","name":"London","lat":51.5,"long":-0.083333,"routeStop":4}]}
```
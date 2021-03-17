# eventsArchive
> service to saves and retrieves historical events

This service built using [NodeJs](https://nodejs.org/en/), [grpc](https://grpc.io/), [expressjs](http://expressjs.com/), [sequlize](https://sequelize.org/) (orm), seqlit3 and postgress. Tested using [mochajs](https://mochajs.org/).


### How this project is orgnaized:
 * [lib](./lib) where busines logic reside
 * [models](./models) ORM models (map db tables to classes)
 * [proto](./proto) grpc service defination
 * [server/grpc](./server/grpc) grpc server
 * [server/rest](./server/rest) rest api server
 * [client/grpc/node](./client/grpc/node) sample grpc client
 * [swagger](./swagger) swagger documenation for the rest apis
 * [test](./test) unit test
 * [deploy](./deploy) kubernates resources the create deployment, service and ingress for the service
 * [Jeninsfile](./Jenkinsfile) Jenkins pipeline defination to build docker image, test and deploy to k8s cluster
 * [docker-compose.yml](./docker-compose.yml) to run grpc server, rest server, swagger-ui, postgres and adminer

### install dependencies
```bash
npm install
```
### test
* the [test](./test/lib/events.test.js) is mainly for the business logic that reside in [lib/events.js](./lib/events.js). not so much happening in the lib directory at the moment, but this may be extended in the future by adding support for caching or another data storage (i.e elasticsearh)
* Testing makes sure that create and filter events functinality works and it return expected errors when invalid data provided.
    ```bash
    npm test
    ```
### run locally
```
npm run grpcServer # will start grpc server on 0.0.0.0:6001
npm run restServer # will start rest server on 0.0.0.0:9001
```

### run with docker-compose
 * start
    ```bash
    docker-compose down -t 1 && docker-compose rm && docker-compose build && docker-compose up -d
    ```
 * you get access to:
    * grpc server => [0.0.0.0:6001](http://0.0.0.0:6001)
    * REST server => [0.0.0.0:9001](http://0.0.0.0:9001)
    * swagger-ui interface => [0.0.0.0:8082](http://0.0.0.0:8082)
    * adminer interface => [0.0.0.0:8080](http://0.0.0.0:8080) (postgres db: host=db, username=postgres, password=events)
 * add or lookup events
    * using rest
        * easy way with swagger [0.0.0.0:8082](http://0.0.0.0:8082)
        * or with curl
            ```bash
            # for better view, please pipe the curl output into jq https://stedolan.github.io/jq
            curl 'localhost:9001/api/filter'

            curl \
                --request POST \
                --header "Content-Type: application/json" \
                --data '{"email":"xyz@hero.com","component":"order","environment":"development","message":"adding an order","payload":"'\{"a":"b"\}'"}' \
                http://localhost:9001/api/event

            curl 'localhost:9001/api/filter?since=2020-01-01'
            curl 'localhost:9001/api/filter?since=2020-01-01&environment=development'
            curl 'localhost:9001/api/filter?since=2020-01-01&message=error'
            ```
    * using grpc, for details, please check [README.md](./client/grpc/node/README.md)
        ```bash
        # first, make sure grpc server is running
        npm run grpcServer
        # load dummy data
        node client/grpc/node/load.js
        # search
        node client/grpc/node/search.js --since 2021-01-30 --message error
        ```


#### how to run on production grade mode
    I assume Jenkins is used as a build server.
    You could configure Jenkins with new pipeline job based on [Jenkinsfile](./Jenkinsfile)
    Jenkinsfile will build you docker image, run the test, push to nexus (I assume you store dockr images on nexus) and lastly
    update [kubernates deployment](./deploy/dev/111-deployment.yaml) on dev namespace


### TODO
 * if searching using text is needed to be more sophisticated, we could use elasticsearch to store the events and make the search functionality served only be looking up elasticsearch index (in this case, we need to keep the data in db and in elasticsearch in sync).

 * optimize event table by adding any needed indexes to speed up the /filter endpoint. One need first to look on how the /filter used to get an idea on how most users call it.

 * for heavy load application that doesn't really need to fellow request-resonse model, adapting [pubsub](https://cloud.google.com/pubsub/docs/overview) will be much fitted in some cases; for example here, I don't think that it required to wait for the event to be stored in database before returning a response. so this service could subscribe to a topic (a channel) where events arrive and eventually grab those events and process them (producer of those events has no driect link to eventsService anymore - they are decoupled)

 * benchmark testing using [ab](https://httpd.apache.org/docs/2.4/programs/ab.html)


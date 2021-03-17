# grpc client

#### how to use
* load events data (dummy/csv)
    ```bash
    # make sure grpc server is running
    npm run grpcServer
    # will send 500 dummy event
    node client/grpc/node/load.js

    # send events in a csv file
    node client/grpc/node/load.js $PWD/test/data/events.csv
    ```
* search
    ```
    node client/grpc/node/search.js --since 2020-01-30
    node client/grpc/node/search.js \
        --since 2020-01-30 \
        --pageNumber 1 \
        --component cart \
        --environment production \
        --message success \
        --email 'Fredy.Green@yahoo.com'

            >> Search result:
            >>     request     :
            >>         pageNumber      : 1
            >>         resultPerPage   : 10
            >>         since           : 2020-01-30T05:00:00.000Z
            >>     recordsCount: 1
            >>     hitsCount   : 1
            >>     took        : 4ms
            >>     hits        :
            >>         id          : 5101d837-71b6-4ff5-bab1-c48f3c10a0e8
            >>         createdAt   : 1609755050
            >>         environment : production
            >>         email       : Fredy.Green@yahoo.com
            >>         component   : cart
            >>         message     : the buyer #58571 has placed an order successfully
    ```
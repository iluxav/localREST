Local REST server and xhr interceptor
=====================================

Local REST interceptor and in memory storage. Mocks REST'full http backend

Usage
------------

'''javascript
 var localServer = new LocalRESTServer();
        localServer.start({
            endpoints: ['https://api.github.com/'],
            seedData: [
                {
                    url: 'https://api.github.com/repos',
                    data: {
                        "some": "data"
                    }
                }
            ]
        });

'''
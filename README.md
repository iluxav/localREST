Local REST server and xhr interceptor
=====================================

Local REST interceptor and in memory storage. Mocks REST'full http backend

Usage
------------

```JavaScript
//Create new LocalRESTServer instance
 var localServer = new LocalRESTServer();
//Start interceptor
//NOTE! It will supress all your XHR calls from your app
 localServer.start({
     endpoints: ['https://api.github.com/'], // Specify endpoints, usually domain names
     seedData: [ //Seed data 
         {
             url: 'https://api.github.com/repos',
             data: {
                 "some": "data"
             }
         }
     ]
 });

```
###Seed data
Data can be passed as an object literal or as array of objects
```Javascript
  seedData: [ //Seed data 
         {
             url: 'https://api.github.com/repos',
             data:[ {"some": "data1"}, {"some": "data2"}]
         }
     ]
```


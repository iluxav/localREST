Local REST server and xhr interceptor
=====================================

This JavaScript library provides a mock implementation of a REST API server. It replaces the XMLHttpRequest object and basically intercepts all the XHR call from your app.
It supports jQuery AJAX calls and AngularJS $http provider.
The idea is to start your project by simply defining you API first, add seed data if needed and just start reading and writing.

All the data will be presisted in memory and/or local storage.

Usage
------------
###Start Server
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
###Stop Server
```Javascript
localServer.stop();
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


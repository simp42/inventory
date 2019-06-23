This application is built to run on a MongoDB Atlas database with
a MongoDB Stitch application tunning atop it.
To test the application both are available as afree tier.

Set up instructions:
* Create a MongoDB account if you don#t have one yet under
 http://cloud.mongodb.com/
 
* Create a new MongoDB Atlas cluster
  * See also: http://docs.atlas.mongodb.com/getting-started

* Create a new MongoDB Stitch application
  * Follow step 3 from the tutorial at: https://docs.mongodb.com/stitch/tutorials/guides/todo-backend/
 
* Create an API key for your organization at https://cloud.mongodb.com/v2#/account/organizations
  * See also: https://docs.atlas.mongodb.com/configure-api-access/#programmatic-api-keys 
  * The API key should have the project owner role for the project of the Stitch application,
  so that it has the neccessary permission to import a project
  
* In a terminal window navigate to the project directory (i.e. the directory this file is contained in) 
 and log in to stitch cli with the newly create API key
 ```./stitch-clilogin --api-key=PUBLICKEY --private-api-key=long-hex-string-private-key``` 
 
* Once you are successfully logged in you can import the app configuration into Stitch 
 ```./stitch-cli import --path /src/stitch-app --strategy=merge```
This application is built to run on a MongoDB Atlas database with
a MongoDB Stitch application tunning atop it.
To test the application both are available as afree tier.

Set up instructions:
* Create a MongoDB account if you don't have one yet under
 http://cloud.mongodb.com/
 
* Create a new MongoDB Atlas cluster
  * See also: http://docs.atlas.mongodb.com/getting-started

* Create an API key for your organization at https://cloud.mongodb.com/v2#/account/organizations
  * See also: https://docs.atlas.mongodb.com/configure-api-access/#programmatic-api-keys 
  * The API key should have the project owner role for the project of the Stitch application,
  so that it has the neccessary permission to import a project

* Edit the JSON files in the directory stitch-app if you want to change the default database name
  or the cluster name. 
  
* In a terminal window navigate to the project directory (i.e. the directory this file is contained in) 
 and log in to stitch cli with the newly create API key
 ```./stitch-clilogin --api-key=PUBLICKEY --private-api-key=long-hex-string-private-key``` 
 
* Once you are successfully logged in you can import the app configuration into Stitch 
 ```./stitch-cli import --path /src/stitch-app --strategy=merge```
 
* You can now create one ore more users in the stitch backend

* To make one of these users an admin of the application, copy his UID (... button in the users list
 in the Stitch backend) and edit the value for admin users.
  * Navigate to the Stitch application backend
  * Go to "Users"
  * Find the admin user you create and click the "..." button and select "Copy UID"
  * Navigate to "Values & Secrets" and click "..." for the value "adminUsers" to edit this value
  * Replace one of the strings in the JSON value with the just copied UID
  
* Now that the backend is set up you have to configure the frontend application by creating an env-file
 in the folder frontend/ overwriting the settings with your custom configuration: 
 ```cp frontend/.env frontend/.env.production.local```. Now edit the file and replace the app
 id (shown in Stitch backend), name of your MongoDB cluster and name of your MongoDB database 
 
* If you don't host the application in the root directory of your server, add a homepage-entry
 in the package.json in the folder frontend/ with the root of your application, e.g. 
 ```"homepage": "http://example.com/inventory",```

* By calling ```./yarn build``` the application can now be built and the contents of the build-folder
 copied to your server.
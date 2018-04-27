# Deployment for the CodeCamp Workbench website

## To Deploy MongoDB Database

1. ???
?. In the root directory run 'node seed' to delete and add the challenges to the database

## To Deploy Website

1. Get the node_modules from the freeCodeCamp-node_modules repository and extract to a node_modules directory off the project root
2. In the project root, make a copy of the .env.default and name it .env
3. In the .env, change any setting such as DEBUG=false to DEBUG=true, you can add a PORT=80 and NODE_ENV='production'
4. In the root directory run 'gulp build' for development or 'NODE_ENV=production gulp build -p' for production
5. In the root directory run 'gulp serve' optionally you can run 'gulp' for a development deployment or 'node pm2Start' for production
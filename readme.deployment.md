# Deployment for the CodeCamp website

## Development Setup CUA

1. Prime the yarn cache using \\fs01.cua.edu\office\tutorDevelopers\npm-packages-offline-cache\yarn-projects\yarn-workbench
2. Yarn install --offline

## Development Setup Streets

1. Yarn install

## Development Setup Common

2. In the project root, make a copy of the .env.default and name it .env
3. In the .env, change any setting such as DEBUG=false to DEBUG=true, you can add a PORT=80 and NODE_ENV='production'
	* Optionally, set NODE_ENV='development' to enable specific dev-only features and additional debugging
4. In the root directory run 'gulp build' to generate the runtime webpack bundle, js, css, and manifest files
5. In the root directory run 'gulp serve' to start the server in development mode
	* Optionally, in the root directory, run 'gulp' for development with hot reloading (BrowserSync port 3000 by default), so you can make changes to files for example without needing to restart (saves time during various development cycles)

## Deployment Production

1. Yarn install
2. In the project root, make a copy of the .env.default and name it .env
3. In the .env, change any setting such as DEBUG=false to DEBUG=true, you can add a PORT=80 and NODE_ENV='production'
4. In the root directory run 'NODE_ENV=production gulp build -p'
5. In the root directory run 'node pm2start'

## To Deploy MongoDB Database

1. In the root directory run 'node seed' to delete and add the challenges to the database
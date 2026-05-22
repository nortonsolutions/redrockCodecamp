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

### Debugger

If you want to start with the inspector running for debug, you can use './babel-start.sh' or YMMV with 'node babelStart'.  

Or, spelled out without a special configuration (this works fine for me):

```bash
pm2 start --interpreter `pwd`/node_modules/.bin/babel-node server/server.js -f --node-args="--inspect=9229"
```


## To Deploy MongoDB Database

1. In the root directory run 'node seed' to delete and add the challenges to the database

-----




When updating a single node package, your mileage may vary with yarn; e.g.,

yarn add stripe@8.222.0 --exact --ignore-engines

the MOST surgical way to do so without affecting other packages:

# Navigate to node_modules
cd node_modules

# Download and extract (e.g.) stripe@8.222.0 directly
npm pack stripe@8.222.0
tar -xzf stripe-8.222.0.tgz
mv package stripe
rm stripe-8.222.0.tgz

# Go back to project root
cd ..

(Another way to do it is to create a separate tree for the special node package, e.g. vendor/my-package, which has its own node_modules)

### Ethical Ads basic steps, per Claude:

#### 1. Apply for an EthicalAds publisher account

Go to https://www.ethicalads.io/publishers/
They prioritize developer / programming / open-source / education content — Redrock CodeCamp qualifies
Application asks for: site URL, traffic estimates, content type. Approval is manual and usually a few days
Once approved you get a publisher ID (e.g. redrockcodecamp)

#### 2. Add the ad script + a placement to your challenge layout

Their snippet is just two pieces of HTML. The natural place is the lesson view (right rail or below the instructions panel). For example, in the Jade-rendered base layout or directly in the React challenge pane:

For a React-based placement, create a small component like <EthicalAd type="image" /> that renders the div and (on mount, once) calls ethicalads.load() if the global is present.

#### 3. Decide placement

EthicalAds asks you keep placements minimal (1–2 per page). Recommended spots for Redrock:

Below the lesson instructions panel on the challenge page
On the curriculum map (/en)
On the marketing/landing page

#### 4. Set referral policy and test anonymously

Confirm a browser arriving with Referer: https://*redrockCodecamp. to your /en URL gets through to a lesson and is not redirected to /signin. You can test with:
You should see a 302 to a /en/challenges/... URL, not /signin.

#### 5. Optional polish (after ads are live)

A small "Ad" label above the placement (EthicalAds requires this; their script auto-adds it for the default styling)
Hide ad placements for signed-in paying members (if you add a paid tier later)
A noscript fallback so the layout doesn't jump



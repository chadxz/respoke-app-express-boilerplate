# respoke-app-express-boilerplate

Building a node.js web application with authentication involves a great deal of boilerplate to get up and running. This
repo intends to serve as a jumpstart for this scenario. Some features:

 - express.js server framework
 - local account creation & management
 - social signon using twitter, github, and google
 - ability to associate existing account with social login methods
 - ability to retrieve vanity details about other users that have signed up
 - ability to perform Respoke brokered authentication for a logged-in user

some things this project does **not** have:

 - no modules that require native addons, making it easy to get started on windows
 - no attempt to define look and feel
 - no advanced tools (transpilers, minifiers, bundlers, build tools). You can add any of these as needed!
 - no requirement of database backend, thanks to nedb database

## getting started

 1. `git clone https://github.com/chadxz/respoke-app-express-boilerplate.git --depth=1 your-app-name` to retrieve the repo
 with only the most recent history. This makes the clone quick!
 1. `cd your-app-name && rm -rf .git` to remove the repo history so you can start your repo fresh
 1. `npm install` to install the project dependencies
 1. change the project name in `package.json` and `bower.json`, to make the project your own
 1. `npm start` to start the server on http://localhost:8080

## configuration for Respoke brokered auth

Out of the box, this application will automatically retrieve a Respoke authentication token for you once
logged in, and provides a route `/respoke/token` to refresh that authentication token if needed. To enable
this functionality, you must provide the server with your Respoke `app id`, `app secret`, and a `roleId`
to be used when requesting a token.

When configured, the default logged-in page has an example of using this token to connect to Respoke.

## obtaining API keys

By default, the project only has local login enabled. To enable social login via google, github, or twitter, you must
obtain the appropriate credentials from the respective service. Once you obtain the necessary credentials, you can copy
`config/default.js` to `config/local.js`, and fill in your credentials under the service's object. Once the credentials
have been filled in, you can toggle the social login method by setting the `enable` property to `true` or `false` as
needed.

<img src="http://images.google.com/intl/en_ALL/images/srpr/logo6w.png" width="200">

- Visit [Google Cloud Console](https://cloud.google.com/console/project)
- Click **CREATE PROJECT** button
- Enter *Project Name*, then click **CREATE**
- Then select *APIs & auth* from the sidebar and click on *Credentials* tab
- Click **CREATE NEW CLIENT ID** button
 - **Application Type**: Web Application
 - **Authorized Javascript origins**: `http://localhost:8080`
 - **Authorized redirect URI**: `http://localhost:8080/auth/google/callback`
- Copy and paste *Client ID* and *Client secret* keys into `config/local.js`

**Note:** When you ready to deploy to production don't forget to add your new url to *Authorized Javascript origins*
and *Authorized redirect URI*, e.g. `http://my-awesome-app.herokuapp.com` and
`http://my-awesome-app.herokuapp.com/auth/google/callback` respectively. The same goes for other providers.

<img src="https://github.global.ssl.fastly.net/images/modules/logos_page/GitHub-Logo.png" width="200">

- Go to [Account Settings](https://github.com/settings/profile)
- Select **Applications** from the sidebar
- Then inside **Developer applications** click on **Register new application**
- Enter *Application Name* and *Homepage URL*.
- For *Authorization Callback URL*: `http://localhost:8080/auth/github/callback`
- Click **Register application**
- Now copy and paste *Client ID* and *Client Secret* keys into `config/local.js`

<img src="https://g.twimg.com/Twitter_logo_blue.png" width="90">

- Sign in at [https://apps.twitter.com/](https://apps.twitter.com/)
- Click **Create a new application**
- Enter your application name, website and description
- For **Callback URL**: `http://localhost:8080/auth/twitter/callback`
- Go to **Settings** tab
- Under *Application Type* select **Read and Write** access
- Check the box **Allow this application to be used to Sign in with Twitter**
- Click **Update this Twitter's applications settings**
- Copy and paste *Consumer Key* and *Consumer Secret* keys into `config/local.js`

## screenshots
![login](https://cloud.githubusercontent.com/assets/309219/7868265/61647f70-0540-11e5-93ff-ffd1d4839d96.png)

![signup](https://cloud.githubusercontent.com/assets/309219/7868268/6167e246-0540-11e5-8ecc-e24d0949dc0b.png)

![account management 1](https://cloud.githubusercontent.com/assets/309219/7868266/61660e12-0540-11e5-8e12-dccf7606f2da.png)

![account management 2](https://cloud.githubusercontent.com/assets/309219/7868267/61665cb4-0540-11e5-8b58-a441484c62a0.png)

## license
[MIT](LICENSE-MIT)

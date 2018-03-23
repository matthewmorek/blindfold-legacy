# Blindfold
_Blindfold_ is a small web app built in Node.js that allows you to turn off/on retweets from the people you follow on Twitter. Because life is too short to keep ingesting negative crap all the time.

## Getting started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
What you’ll need to get started.

- Git
- NodeJS 6+
- `npm` or Yarn

### Initial setup

1. Using Git, clone this repository to your local machine.
2. Run `npm install` or `yarn` from inside the project's directory to install all dependencies.
3. Get your Consumer Key and Secret from https://apps.twitter.com.
4. Run `cp ./env-default ./.env` and adjust config variables.
5. Start the app by running `yarn start` or `npm run start`;

### Project tree
```bash
├── app               // main app dir where all the server-side logic is
│   ├── config.js       // configuration script that preps env vars, etc.
│   ├── index.js        // starting point of the app
│   └── router.js       // server-side logic and route-handling
├── assets            // client-side scripts and styles
│   ├── js
│   └── scss
├── public            // where all the static bits are being dumped to
│   ├── css
│   ├── images
│   └── js
├── views             // app frontend templates
│   ├── layouts         // surprise! only one layout here!
│   ├── partials        // a few bits and bobs that make the page whole
│   └── index.njk       // master template file in Nunjucks format
├── env-default       // config template with sane local defaults
├── gruntfile.js      // all the build logic is in there
├── package.json
├── readme.md         // you are reading this!
└── yarn.lock         // can you tell I am a fan of Yarn yet?
```

### Configuration
_Blindfold_ has only a handful of options, but they are all required before the app can run, otherwise expect it to complain.

### Development
If you want to tinker with this project, use Grunt to help you by handling auto-reloading of the app, as well as any connected browsers (via BrowserSync).

```bash
$ grunt
```

### Contributing
This is a for-fun project that most likely is full of bugs, untested things, and can likely fall on its head when mistreated. Feel free to report any bugs, issues, feature requests, etc.

If you spot something you can fix yourself, fork the repo, commit your code on a feature branch and open a pull request.

**I will happily review all contributions, especially those that help with establishing automated smoke-screen testing of the app.**

#### Notice
This app was never meant to be yet another Twitter client of any kind, so don't expect me to add new features such as feeds, lists, etc. Laser-sharp focus, young padawan.

---

2018 © MADBIT Co.

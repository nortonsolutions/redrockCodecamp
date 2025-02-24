import dedent from 'dedent';
import moment from 'moment-timezone';
import { Observable } from 'rx';
import debugFactory from 'debug';
import emoji from 'node-emoji';
import bcrypt from 'bcryptjs';

import {
  frontEndChallengeId,
  backEndChallengeId,
  respWebDesignId,
  frontEndLibsId,
  jsAlgoDataStructId,
  dataVisId,
  apisMicroservicesId,
  infosecQaId
} from '../utils/constantStrings.json';
import certTypes from '../utils/certTypes.json';
import {
  ifNoUser401,
  ifNoUserRedirectTo,
  ifNotVerifiedRedirectToSettings
} from '../utils/middleware';
import { observeQuery } from '../utils/rx';
import {
  prepUniqueDaysByHours,
  calcCurrentStreak,
  calcLongestStreak
} from '../utils/user-stats';
import supportedLanguages from '../../common/utils/supported-languages';
import { getChallengeInfo, cachedMap } from '../utils/map';

const isSignUpDisabled = process.env.DISABLE_SIGNUP === 'true';
const isBridgesCodeCamp = (process.env.BUSINESS_NAME === "Bridges");
const businessAppName = process.env.BUSINESS_NAME + " " + process.env.APP_NAME;
const directorName = process.env.DIRECTOR_NAME;

const debug = debugFactory('fcc:boot:user');
const sendNonUserToMap = ifNoUserRedirectTo('/map');
const certIds = {
  [certTypes.frontEnd]: frontEndChallengeId,
  [certTypes.backEnd]: backEndChallengeId,
  [certTypes.respWebDesign]: respWebDesignId,
  [certTypes.frontEndLibs]: frontEndLibsId,
  [certTypes.jsAlgoDataStruct]: jsAlgoDataStructId,
  [certTypes.dataVis]: dataVisId,
  [certTypes.apisMicroservices]: apisMicroservicesId,
  [certTypes.infosecQa]: infosecQaId
};

const certViews = {
  [certTypes.frontEnd]: 'certificate/front-end.jade',
  [certTypes.backEnd]: 'certificate/back-end.jade',
  [certTypes.fullStack]: 'certificate/full-stack.jade',
  [certTypes.respWebDesign]: 'certificate/responsive-web-design.jade',
  [certTypes.frontEndLibs]: 'certificate/front-end-libraries.jade',
  [certTypes.jsAlgoDataStruct]:
    'certificate/javascript-algorithms-and-data-structures.jade',
  [certTypes.dataVis]: 'certificate/data-visualization.jade',
  [certTypes.apisMicroservices]: 'certificate/apis-and-microservices.jade',
  [certTypes.infosecQa]:
    'certificate/information-security-and-quality-assurance.jade'
};

const certText = {
  [certTypes.frontEnd]: 'Front End certified',
  [certTypes.backEnd]: 'Back End Certified',
  [certTypes.fullStack]: 'Full Stack Certified',
  [certTypes.respWebDesign]: 'Responsive Web Design Certified',
  [certTypes.frontEndLibs]: 'Front End Libraries Certified',
  [certTypes.jsAlgoDataStruct]:
    'JavaScript Algorithms and Data Structures Certified',
  [certTypes.dataVis]: 'Data Visualization Certified',
  [certTypes.apisMicroservices]: 'APIs and Microservices Certified',
  [certTypes.infosecQa]: 'Information Security and Quality Assurance Certified'
};

const dateFormat = 'MMM DD, YYYY';

function replaceScriptTags(value) {
  return value
    .replace(/<script>/gi, 'fccss')
    .replace(/<\/script>/gi, 'fcces');
}

function replaceFormAction(value) {
  return String(value).replace(/<form[^>]*>/, function (val) {
    return val.replace(/action(\s*?)=/, 'fccfaa$1=');
  });
}

function encodeFcc(value = '') {
  return replaceScriptTags(replaceFormAction(value));
}

function isAlgorithm(challenge) {
  // test if name starts with hike/waypoint/basejump/zipline
  // fix for bug that saved different challenges with incorrect
  // challenge types
  return !(/^(waypoint|hike|zipline|basejump)/i).test(challenge.name) &&
    +challenge.challengeType === 5;
}

function isProject(challenge) {
  return +challenge.challengeType === 3 ||
    +challenge.challengeType === 4;
}

function getChallengeGroup(challenge) {
  if (isProject(challenge)) {
    return 'projects';
  } else if (isAlgorithm(challenge)) {
    return 'algorithms';
  }
  return 'challenges';
}

// buildDisplayChallenges(
//   entities: { challenge: Object, challengeIdToName: Object },
//   challengeMap: Object,
//   tz: String
// ) => Observable[{
//   algorithms: Array,
//   projects: Array,
//   challenges: Array
// }]
function buildDisplayChallenges(
  { challengeMap, challengeIdToName },
  userChallengeMap = {},
  timezone
) {
  return Observable.from(Object.keys(userChallengeMap))
    .map(challengeId => userChallengeMap[challengeId])
    .map(userChallenge => {
      const challengeId = userChallenge.id;
      const challenge = challengeMap[challengeIdToName[challengeId]];
      let finalChallenge = { ...userChallenge, ...challenge };
      if (userChallenge.completedDate) {
        finalChallenge.completedDate = moment
          .tz(userChallenge.completedDate, timezone)
          .format(dateFormat);
      }

      if (userChallenge.lastUpdated) {
        finalChallenge.lastUpdated = moment
          .tz(userChallenge.lastUpdated, timezone)
          .format(dateFormat);
      }

      return finalChallenge;
    })
    .filter(({ challengeType }) => challengeType !== 6)
    .groupBy(getChallengeGroup)
    .flatMap(group$ => {
      return group$.toArray().map(challenges => ({
        [getChallengeGroup(challenges[0])]: challenges
      }));
    })
    .reduce((output, group) => ({ ...output, ...group }), {})
    .map(groups => ({
      algorithms: groups.algorithms || [],
      projects: groups.projects ? groups.projects.reverse() : [],
      challenges: groups.challenges ? groups.challenges.reverse() : []
    }));
}

module.exports = function (app) {
  const router = app.loopback.Router();
  const api = app.loopback.Router();
  const { AccessToken, Email, User } = app.models;
  const map$ = cachedMap(app.models);

  function findUserByUsername$(username, fields) {
    return observeQuery(
      User,
      'findOne',
      {
        where: { username },
        fields
      }
    );
  }

  AccessToken.findOne$ = Observable.fromNodeCallback(
    AccessToken.findOne, AccessToken
  );

  router.get('/login', function (req, res) {
    res.redirect(301, '/signin');
  });
  router.get('/logout', function (req, res) {
    res.redirect(301, '/signout');
  });

  // NOTE: a router.post() did not work were a api.post() did. Investigate.

  router.get('/signup', getSignUp);
  api.post('/signup', postSignUp);

  router.get('/signout', signout);
  router.get('/email-signin', getEmailSignin);
  router.get('/deprecated-signin', getDepSignin);
  router.get('/temp-signin', getTempSignin);

  router.get('/signin', getEmailSignin);
  api.post('/signin', postEmailSignin);


  router.get(
    '/delete-my-account',
    sendNonUserToMap,
    showDelete
  );
  api.post(
    '/account/delete',
    ifNoUser401,
    postDeleteAccount
  );
  api.get(
    '/account',
    sendNonUserToMap,
    getAccount
  );
  router.get(
    '/reset-my-progress',
    sendNonUserToMap,
    showResetProgress
  );
  api.post(
    '/account/resetprogress',
    ifNoUser401,
    postResetProgress
  );

  api.get(
    '/account/unlink/:social',
    sendNonUserToMap,
    getUnlinkSocial
  );

  // Ensure these are the last routes!
  api.get(
    '/:username/front-end-certification',
    showCert.bind(null, certTypes.frontEnd)
  );

  api.get(
    '/:username/back-end-certification',
    showCert.bind(null, certTypes.backEnd)
  );

  api.get(
    '/:username/full-stack-certification',
    (req, res) => res.redirect(req.url.replace('full-stack', 'back-end'))
  );

  api.get(
    '/:username/responsive-web-design-certification',
    showCert.bind(null, certTypes.respWebDesign)
  );

  api.get(
    '/:username/front-end-libraries-certification',
    showCert.bind(null, certTypes.frontEndLibs)
  );

  api.get(
    '/:username/javascript-algorithms-data-structures-certification',
    showCert.bind(null, certTypes.jsAlgoDataStruct)
  );

  api.get(
    '/:username/data-visualization-certification',
    showCert.bind(null, certTypes.dataVis)
  );

  api.get(
    '/:username/apis-microservices-certification',
    showCert.bind(null, certTypes.apisMicroservices)
  );

  api.get(
    '/:username/information-security-quality-assurance-certification',
    showCert.bind(null, certTypes.infosecQa)
  );

  router.get('/:username', showUserProfile);
  router.get(
    '/:username/report-user/',
    sendNonUserToMap,
    ifNotVerifiedRedirectToSettings,
    getReportUserProfile
  );

  api.post(
    '/:username/report-user/',
    ifNoUser401,
    postReportUserProfile
  );

  app.use('/:lang', router);
  app.use(api);

  const defaultErrorMsg = ['Oops, something is not right, please request a ',
    'fresh link to sign in / sign up.'].join('');

  function postPasswordlessAuth(req, res) {

    if (req.user || !(req.body && req.body.email)) {

      req.flash('info', {
        msg: 'Hey, looks like you’re already signed in.'
      });

      return res.redirect('/');
    }

    return User.requestAuthEmail(req.body.email)
      .then(msg => {
        return res.status(200).send({ message: msg });
      })
      .catch(err => {
        debug(err);
        return res.status(200).send({ message: defaultErrorMsg });
      });
  }

  function invalidateAuthToken(req, res, next) {
    if (req.user) {
      res.redirect('/');
    }

    if (!req.query || !req.query.email || !req.query.token) {
      req.flash('info', { msg: defaultErrorMsg });
      return res.redirect('/email-signin');
    }

    const authTokenId = req.query.token;
    const authEmailId = new Buffer(req.query.email, 'base64').toString();

    return AccessToken.findOne$({ where: { id: authTokenId } })
      .map(authToken => {
        if (!authToken) {
          req.flash('info', { msg: defaultErrorMsg });
          return res.redirect('/email-signin');
        }

        const userId = authToken.userId;
        return User.findById(userId, (err, user) => {
          if (err || !user || user.email !== authEmailId) {
            debug(err);
            req.flash('info', { msg: defaultErrorMsg });
            return res.redirect('/email-signin');
          }
          return authToken.validate((err, isValid) => {
            if (err) { throw err; }
            if (!isValid) {
              req.flash('info', {
                msg: ['Looks like the link you clicked has',
                  'expired, please request a fresh link, to sign in.'].join('')
              });
              return res.redirect('/email-signin');
            }
            return authToken.destroy((err) => {
              if (err) { debug(err); }
              next();
            });
          });
        });
      })
      .subscribe(
        () => { },
        next
      );
  }

  function getTempSignin(req, res, next) {

    if (req.user) {
      req.flash('info', {
        msg: 'Hey, looks like you’re already signed in.'
      });
      return res.redirect('/');
    }

    if (!req.query || !req.query.email) {
      return res.redirect('/email-signin');
    }

    const email = req.query.email;

    return User.findOne$({ where: { email } })
      .map(user => {

        if (!user) {
          debug(`did not find a valid user with email: '${email}'`);
          req.flash('info', { msg: defaultErrorMsg });
          return res.redirect('/signin');
        }

        const emailVerified = true;
        const emailAuthLinkTTL = null;
        const emailVerifyTTL = null;
        user.update$({
          emailVerified, emailAuthLinkTTL, emailVerifyTTL
        })
          .do((user) => {
            user.emailVerified = emailVerified;
            user.emailAuthLinkTTL = emailAuthLinkTTL;
            user.emailVerifyTTL = emailVerifyTTL;
          });

        return user.createAccessToken(
          { ttl: User.settings.ttl }, (err, accessToken) => {
            if (err) { throw err; }

            var config = {
              signed: !!req.signedCookies,
              maxAge: accessToken.ttl
            };

            if (accessToken && accessToken.id) {
              debug('setting cookies');
              res.cookie('access_token', accessToken.id, config);
              res.cookie('userId', accessToken.userId, config);
            }

            return req.logIn({
              id: accessToken.userId.toString()
            }, err => {
              if (err) { return next(err); }

              debug('user logged in');

              if (req.session && req.session.returnTo) {
                var redirectTo = req.session.returnTo;
                if (redirectTo === '/map-aside') {
                  redirectTo = '/map';
                }
                return res.redirect(redirectTo);
              }

              req.flash('success', {
                msg:
                  'Success! You have signed in to your account. Happy Coding!'
              });
              return res.redirect('/challenges/current-challenge');
            });
          });
      })
      .subscribe(
        () => { },
        next
      );
  }

  function postEmailSignin(req, res, next) {

    const { body: {email, password } } = req;

    return User.findOne$({ where: { email } })
      .map(user => {

        if (!user) {
          req.flashMessage = `Invalid email, please try again.`;

          return getEmailSignin(req, res);
        }
        
        var hashedPassword = bcrypt.hashSync(password, user.passwordSalt);

        if (user.password !== hashedPassword) {
          req.flashMessage = `Invalid password, please try again.`;

          return getEmailSignin(req, res);
        }

        const emailVerified = true;
        const emailAuthLinkTTL = null;
        const emailVerifyTTL = null;
        user.update$({
          emailVerified, emailAuthLinkTTL, emailVerifyTTL
        })
          .do((user) => {
            user.emailVerified = emailVerified;
            user.emailAuthLinkTTL = emailAuthLinkTTL;
            user.emailVerifyTTL = emailVerifyTTL;
          });

        return user.createAccessToken(
          { ttl: User.settings.ttl }, (err, accessToken) => {
            if (err) { throw err; }

            var config = {
              signed: !!req.signedCookies,
              maxAge: accessToken.ttl
            };

            if (accessToken && accessToken.id) {
              debug('setting cookies');
              res.cookie('access_token', accessToken.id, config);
              res.cookie('userId', accessToken.userId, config);
            }

            return req.logIn({
              id: accessToken.userId.toString()
            }, err => {
              if (err) { return next(err); }

              debug('user logged in');

              if (req.session && req.session.returnTo) {
                var redirectTo = req.session.returnTo;
                if (redirectTo === '/map-aside') {
                  redirectTo = '/map';
                }
                return res.redirect(redirectTo);
              }

              req.flash('success', {
                msg:
                  'Success! You have signed in to your account. Happy Coding!'
              });
              return res.redirect('/');
            });
          });
      })
      .subscribe(
        () => { },
        next
      );
  }

  function getPasswordlessAuth(req, res, next) {
    if (req.user) {
      req.flash('info', {
        msg: 'Hey, looks like you’re already signed in.'
      });
      return res.redirect('/');
    }

    if (!req.query || !req.query.email || !req.query.token) {
      req.flash('info', { msg: defaultErrorMsg });
      return res.redirect('/email-signin');
    }

    const email = new Buffer(req.query.email, 'base64').toString();

    return User.findOne$({ where: { email } })
      .map(user => {

        if (!user) {
          debug(`did not find a valid user with email: '${email}'`);
          req.flash('info', { msg: defaultErrorMsg });
          return res.redirect('/email-signin');
        }

        const emailVerified = true;
        const emailAuthLinkTTL = null;
        const emailVerifyTTL = null;
        user.update$({
          emailVerified, emailAuthLinkTTL, emailVerifyTTL
        })
          .do((user) => {
            user.emailVerified = emailVerified;
            user.emailAuthLinkTTL = emailAuthLinkTTL;
            user.emailVerifyTTL = emailVerifyTTL;
          });

        return user.createAccessToken(
          { ttl: User.settings.ttl }, (err, accessToken) => {
            if (err) { throw err; }

            var config = {
              signed: !!req.signedCookies,
              maxAge: accessToken.ttl
            };

            if (accessToken && accessToken.id) {
              debug('setting cookies');
              res.cookie('access_token', accessToken.id, config);
              res.cookie('userId', accessToken.userId, config);
            }

            return req.logIn({
              id: accessToken.userId.toString()
            }, err => {
              if (err) { return next(err); }

              debug('user logged in');

              if (req.session && req.session.returnTo) {
                var redirectTo = req.session.returnTo;
                if (redirectTo === '/map-aside') {
                  redirectTo = '/map';
                }
                return res.redirect(redirectTo);
              }

              req.flash('success', {
                msg:
                  'Success! You have signed in to your account. Happy Coding!'
              });
              return res.redirect('/');
            });
          });
      })
      .subscribe(
        () => { },
        next
      );
  }

  function signout(req, res) {
    req.logout();
    res.redirect('/');
  }


  function getDepSignin(req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    return res.render('account/deprecated-signin', {
      title: 'Sign in to freeCodeCamp using a Deprecated Login'
    });
  }


  function getSignUp(req, res) {
    
    if (isSignUpDisabled) {

      if(isBridgesCodeCamp){
        return res.render('account/signup-disabled', {
          title: 'New sign ups are disabled'
        });
      }

      return res.redirect('/');
    }

    res.render('account/signup', {
      title: `Create a new ${ businessAppName } account`,
      flashMessage: req.flashMessage,
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword
    })
  }

  function postSignUp(req, res) {

    const { body: {email, name, location, password, confirmPassword } } = req;
  
    if (password && password !== confirmPassword) {        
      req.flashMessage = `Passwords do not match, please try again.`;
      return getSignUp(req, res);
    }

    return User.createAccount(email, null, name, location, password)
      .then((result) => {

        var user = result.user;
        
        if (!result.isCreated) { 
          req.flashMessage = result.message;
          return getSignUp(req, res);
        }

        return user.createAccessToken(
          { ttl: User.settings.ttl }, (err, accessToken) => {
            if (err) { throw err; }

            var config = {
              signed: !!req.signedCookies,
              maxAge: accessToken.ttl
            };

            if (accessToken && accessToken.id) {
              debug('setting cookies');
              res.cookie('access_token', accessToken.id, config);
              res.cookie('userId', accessToken.userId, config);
            }

            return req.logIn({
              id: accessToken.userId.toString()
            }, err => {
              if (err) { return next(err); }

              debug('user logged in');

              if (req.session && req.session.returnTo) {
                var redirectTo = req.session.returnTo;
                if (redirectTo === '/map-aside') {
                  redirectTo = '/map';
                }
                return res.redirect(redirectTo);
              }

              req.flash('success', {
                msg:
                  'Success! You have created your account.'
              });
              return res.redirect('/');
            });
          });
      })
      .catch(err => {
        debug(err);
        req.flashMessage = err.message;
        return getSignUp(req, res);
      });
  }

  function getEmailSignin(req, res) {

    debug(`req.flashMessage: ${req.flashMessage}`);

    if (req.user) {
      return res.redirect('/');
    }

    return res.render('account/email-signin', {
      title: 'Sign in using your Email Address',
      flashMessage: req.flashMessage,
      email: req.body.email,
      password: req.body.password
    });
  }

  function getAccount(req, res) {
    const { username } = req.user;
    return res.redirect('/' + username);
  }

  function getUnlinkSocial(req, res, next) {
    const { user } = req;
    const { username } = user;

    let social = req.params.social;
    if (!social) {
      req.flash('errors', {
        msg: 'No social account found'
      });
      return res.redirect('/' + username);
    }

    social = social.toLowerCase();
    const validSocialAccounts = ['twitter', 'linkedin'];
    if (validSocialAccounts.indexOf(social) === -1) {
      req.flash('errors', {
        msg: 'Invalid social account'
      });
      return res.redirect('/' + username);
    }

    if (!user[social]) {
      req.flash('errors', {
        msg: `No ${social} account associated`
      });
      return res.redirect('/' + username);
    }

    const query = {
      where: {
        provider: social
      }
    };

    return user.identities(query, function (err, identities) {
      if (err) { return next(err); }

      // assumed user identity is unique by provider
      let identity = identities.shift();
      if (!identity) {
        req.flash('errors', {
          msg: 'No social account found'
        });
        return res.redirect('/' + username);
      }

      return identity.destroy(function (err) {
        if (err) { return next(err); }

        const updateData = { [social]: null };

        return user.update$(updateData)
          .subscribe(() => {
            debug(`${social} has been unlinked successfully`);

            req.flash('info', {
              msg: `You\'ve successfully unlinked your ${social}.`
            });
            return res.redirect('/' + username);
          }, next);
      });
    });
  }

  function showUserProfile(req, res, next) {
    const username = req.params.username.toLowerCase();
    const { user } = req;

    // timezone of signed-in account
    // to show all date related components
    // using signed-in account's timezone
    // not of the profile she is viewing
    const timezone = user && user.timezone ?
      user.timezone :
      'EST';

    const query = {
      where: { username },
      include: 'pledge'
    };

    return User.findOne$(query)
      .filter(userPortfolio => {
        if (!userPortfolio) {
          next();
        }
        return !!userPortfolio;
      })
      .flatMap(userPortfolio => {
        userPortfolio = userPortfolio.toJSON();

        const timestamps = userPortfolio
          .progressTimestamps
          .map(objOrNum => {
            return typeof objOrNum === 'number' ?
              objOrNum :
              objOrNum.timestamp;
          });

        const uniqueHours = prepUniqueDaysByHours(timestamps, timezone);

        userPortfolio.currentStreak = calcCurrentStreak(uniqueHours, timezone);
        userPortfolio.longestStreak = calcLongestStreak(uniqueHours, timezone);

        const calender = userPortfolio
          .progressTimestamps
          .map((objOrNum) => {
            return typeof objOrNum === 'number' ?
              objOrNum :
              objOrNum.timestamp;
          })
          .filter((timestamp) => {
            return !!timestamp;
          })
          .reduce((data, timeStamp) => {
            data[(timeStamp / 1000)] = 1;
            return data;
          }, {});

        if (userPortfolio.isCheater && !user) {
          req.flash('errors', {
            msg: dedent`
              Upon review, this account has been flagged for academic
              dishonesty. If you’re the owner of this account contact
              team@freecodecamp.org for details.
            `
          });
        }

        if (userPortfolio.bio) {
          userPortfolio.bio = emoji.emojify(userPortfolio.bio);
        }

        return getChallengeInfo(map$)
          .flatMap(challengeInfo => buildDisplayChallenges(
            challengeInfo,
            userPortfolio.challengeMap,
            timezone
          ))
          .map(displayChallenges => ({
            ...userPortfolio,
            ...displayChallenges,
            title: userPortfolio.username + '\'s Code Portfolio',
            calender,
            github: userPortfolio.githubURL,
            moment,
            encodeFcc,
            supportedLanguages
          }));
      })
      .doOnNext(data => {
        return res.render('account/show', data);
      })
      .subscribe(
        () => { },
        next
      );
  }

  function showCert(certType, req, res, next) {
    const username = req.params.username.toLowerCase();
    const certId = certIds[certType];
    return findUserByUsername$(username, {
      isGithubCool: true,
      isCheater: true,
      isLocked: true,
      isAvailableForHire: true,
      isFrontEndCert: true,
      isBackEndCert: true,
      isFullStackCert: true,
      isRespWebDesignCert: true,
      isFrontEndLibsCert: true,
      isJsAlgoDataStructCert: true,
      isDataVisCert: true,
      isApisMicroservicesCert: true,
      isInfosecQaCert: true,
      isHonest: true,
      username: true,
      name: true,
      challengeMap: true
    })
      .subscribe(
        user => {
          if (!user) {
            req.flash('errors', {
              msg: `We couldn't find a user with the username ${username}`
            });
            return res.redirect('/');
          }
          // if (!user.isGithubCool) {
          //   req.flash('errors', {
          //     msg: dedent`
          //       This user needs to link GitHub with their account
          //       in order for others to be able to view their certificate.
          //     `
          //   });
          //   return res.redirect(`/${user.username}`);
          // }

          if (user.isCheater) {
            return res.redirect(`/${user.username}`);
          }

          if (user.isLocked) {
            req.flash('errors', {
              msg: dedent`
                ${user.name} has chosen to make their profile
                  private. They will need to make their profile public
                  in order for others to be able to view their certificate.
              `
            });
            return res.redirect("/" + `${username}`);
          }
          if (!user.isHonest) {
            req.flash('errors', {
              msg: dedent`
                ${user.name} has not yet agreed to our Academic Honesty Pledge.
              `
            });

            // Show flash pop-up on the user's page (non-React)
            // return res.redirect("/" + `${username}`);

            // Redirect to /settings page with toast (React):
            return res.redirect("/settings");

          }

          if (user[certType]) {

            const { challengeMap = {} } = user;
            const { completedDate = new Date() } = challengeMap[certId] || {};

            return res.render(
              certViews[certType],
              {
                username: user.username,
                date: moment(new Date(completedDate)).format('MMMM D, YYYY'),
                name: user.name,
                dirName: directorName
              }
            );
          }
          req.flash('errors', {
            msg: `Looks like user ${username} is not ${certText[certType]}`
          });
          return res.redirect(`/${user.username}`);
        },
        next
      );
  }

  function showDelete(req, res) {
    return res.render('account/delete', { title: 'Delete My Account!' });
  }

  function postDeleteAccount(req, res, next) {
    User.destroyById(req.user.id, function (err) {
      if (err) { return next(err); }
      req.logout();
      req.flash('info', { msg: 'You\'ve successfully deleted your account.' });
      return res.redirect('/');
    });
  }

  function showResetProgress(req, res) {
    return res.render('account/reset-progress', {
      title: 'Reset My Progress!'
    });
  }

  function postResetProgress(req, res, next) {
    User.findById(req.user.id, function (err, user) {
      if (err) { return next(err); }
      return user.updateAttributes({
        progressTimestamps: [{
          timestamp: Date.now()
        }],
        currentStreak: 0,
        longestStreak: 0,
        currentChallengeId: '',
        isBackEndCert: false,
        isFullStackCert: false,
        isDataVisCert: false,
        isFrontEndCert: false,
        challengeMap: {},
        challegesCompleted: []
      }, function (err) {
        if (err) { return next(err); }
        req.flash('info', { msg: 'You\'ve successfully reset your progress.' });
        return res.redirect('/');
      });
    });
  }

  function getReportUserProfile(req, res) {
    const username = req.params.username.toLowerCase();
    return res.render('account/report-profile', {
      title: 'Report User',
      username
    });
  }

  function postReportUserProfile(req, res, next) {
    const { user } = req;
    const { username } = req.params;
    const report = req.sanitize('reportDescription').trimTags();

    if (!username || !report || report === '') {
      req.flash('errors', {
        msg: 'Oops, something is not right please re-check your submission.'
      });
      return next();
    }

    return Email.send$({
      type: 'email',
      to: 'team@freecodecamp.org',
      cc: user.email,
      from: 'team@freecodecamp.org',
      subject: 'Abuse Report : Reporting ' + username + '\'s profile.',
      text: dedent(`
        Hello Team,\n
        This is to report the profile of ${username}.\n
        Report Details:\n
        ${report}\n\n
        Reported by:
        Username: ${user.username}
        Name: ${user.name}
        Email: ${user.email}\n
        Thanks and regards,
        ${user.name}
      `)
    }, err => {
      if (err) {
        err.redirectTo = '/' + username;
        return next(err);
      }

      req.flash('info', {
        msg: 'A report was sent to the team with ' + user.email + ' in copy.'
      });
      return res.redirect('/');
    });
  }

};

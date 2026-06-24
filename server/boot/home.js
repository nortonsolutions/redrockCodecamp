import { defaultProfileImage } from '../../common/utils/constantStrings.json';
import supportedLanguages from '../../common/utils/supported-languages';
import dedent from 'dedent';
import { DEFAULT_ANONYMOUS_LANDING } from '../middlewares/anonymous-referrer';

const message =
  'Learn to Code and Help Nonprofits';
  
const isTrialMode = process.env.IS_TRIAL_MODE === 'true';

module.exports = function(app) {
  var router = app.loopback.Router();
  //router.get('/', addDefaultImage, index);
  router.get('/', index);
  app.use(
      '/:lang',
      (req, res, next) => {
        // add url language to request for all routers
        req._urlLang = req.params.lang;
        next();
      },
      router
    );
  app.use(router);

  // function addDefaultImage(req, res, next) {
  //   if (!req.user || req.user.picture) {
  //     return next();
  //   }
  //   return req.user.update$({ picture: defaultProfileImage })
  //     .subscribe(
  //       () => next(),
  //       next
  //     );
  // }

  function index(req, res, next) {
    // Landing-portal hosts (e.g. silvermedal.net) always see a branded
    // entryway first — even when signed in — and click through to the
    // academy. Branding is resolved by middlewares/domain-branding.js.
    const branding = res.locals.branding || {};
    if (branding.isLandingPortal) {
      return res.render('silvermedal-landing', {
        title: branding.businessAppName,
        branding: branding,
        user: req.user,
        continueUrl: req.user ? '/challenges/current-challenge' : '/signin'
      });
    }

    if (!supportedLanguages[req._urlLang]) {
      return next();
    }

    if (req.user) {
      return res.redirect('/challenges/current-challenge');
    }

    // Anonymous visitors arriving from an approved referrer
    // (see middlewares/anonymous-referrer.js) get to keep browsing without
    // being forced to /signin. Resume their last lesson if we have one,
    // otherwise drop them on the configured default landing lesson.
    if (req.session && req.session.allowAnonymous) {
      const target = req.session.lastVisitedChallenge ||
        DEFAULT_ANONYMOUS_LANDING;
      return res.redirect(target);
    }

    if (!isTrialMode) {
      return res.redirect('/signin');
    }

    return res.redirect('/challenges/current-challenge');
  }
};

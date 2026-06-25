import debug from 'debug';
import { renderToString } from 'react-dom/server';
import createMemoryHistory from 'history/createMemoryHistory';
import { NOT_FOUND } from 'redux-first-router';
import devtoolsEnhancer from 'remote-redux-devtools';

import {
  errorThrowerMiddleware
} from '../utils/react.js';
import { createApp, provideStore, App } from '../../common/app';
import waitForEpics from '../../common/utils/wait-for-epics.js';
import { titleSelector } from '../../common/app/redux';
import { adminRoot } from '../utils/constantStrings.json';

const log = debug('rrcc:react-server');
const isDev = process.env.NODE_ENV !== 'production';

// add routes here as they slowly get reactified
// remove their individual controllers
const routes = [
  '/challenges',
  '/challenges/*',
  '/map',
  '/settings',
  '/settings/*'
];

const devRoutes = [];

const middlewares = isDev ? [errorThrowerMiddleware] : [];
export default function reactSubRouter(app) {
  var router = app.loopback.Router();

  router.get('/videos', (req, res) => res.redirect('/map'));
  router.get(
    '/videos/:dashedName',
    (req, res) => res.redirect(`/challenges/${req.params.dashedName}`)
  );

  // These routes are in production
  routes.forEach((route) => {
    router.get(route, serveReactApp);
  });

  if (process.env.NODE_ENV === 'development') {
    devRoutes.forEach(function(route) {
      router.get(route, serveReactApp);
    });
  }

  app.use('/:lang', router);

  function serveReactApp(req, res, next) {
    const { lang } = req;
    const serviceOptions = { req };
    // Seed the SSR state with the host that resolved this request's branding
    // (set by middlewares/domain-branding.js). The Nav reads it via
    // hostnameSelector so the server renders the same brand the client will,
    // preventing a flash of the default brand name before hydration.
    const branding = res.locals.branding || {};
    const hostname = branding.hostkey || req.hostname;
    createApp({
      serviceOptions,
      middlewares,
      enhancers: [
        // devtoolsEnhancer({ suppressConnectErrors: true })
      ],
      history: createMemoryHistory({ initialEntries: [ req.originalUrl ] }),
      defaultState: { app: { lang, adminRoot, hostname } }
    })
      .filter(({
        location: {
          type,
          kind,
          pathname
        } = {}
      }) => {
        if (kind === 'redirect') {
          log('react found a redirect');
          res.redirect(pathname);
          return false;
        }

        if (type === NOT_FOUND) {
          log(`react tried to find ${req.path} but got 404`);
          next();
          return false;
        }

        return true;
      })
      .flatMap(({ store, epic }) => {
        return waitForEpics(epic)
          .map(() => renderToString(
            provideStore(App, store)
          ))
          .map((markup) => ({ markup, store, epic }));
      })
      .do(({ markup, store, epic }) => {
        log('react markup rendered, data fetched');
        const state = store.getState();
        const title = titleSelector(state);
        epic.dispose();
        res.expose(state, 'data', { isJSON: true });
        res.expose(req.flash(), 'flash', { isJSON: true });
        res.render('layout-react', { markup, title });
      })
      .subscribe(() => log('html rendered and sent'), next);
  }
}

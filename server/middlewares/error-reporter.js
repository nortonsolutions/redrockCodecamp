import debug from 'debug';

import {
  isHandledError,
  unwrapHandledError
} from '../utils/create-handled-error.js';

const log = debug('rrcc:middlewares:error-reporter');

export default function errorHandler() {
  if (process.env.NODE_ENV !== 'production') {
    return (err, req, res, next) => {
      if (isHandledError(err)) {
        // log out user messages in development
        const handled = unwrapHandledError(err);
        log(handled.message);
      }
      next(err);
     };
  }
  return (err, req, res, next) => {
    // handled errors do not need to be reported
    // the report a message and redirect the user
    if (isHandledError(err)) {
      return next(err);
    }
    
    // Log error to console instead of Opbeat (which is deprecated/shutdown)
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    return next(err);
  };
}

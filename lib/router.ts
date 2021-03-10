import { Router, Request, Response, NextFunction, RequestParamHandler, RouterOptions } from 'express';

import { requestValidator } from './validator';
import { TMethod, IValidatorRouter } from './types';

const Layer = require('express/lib/router/layer');
const Route = require('express/lib/router/route');

function copyFnProps(oldFn: any, newFn: any) {
  Object.keys(oldFn).forEach((key) => {
    // eslint-disable-next-line no-param-reassign
    newFn[key] = oldFn[key];
  });
  return newFn;
}

function wrap(fn: RequestParamHandler) {
  const newFn = (...args: any[]) => {
    const middleware = fn.apply(this, args);
    if (middleware?.catch) {
      const next = args[2] || Function.prototype;
      middleware.catch((err: Error) => next(err));
    }
    return middleware;
  };

  Object.defineProperty(newFn, 'length', {
    value: fn.length,
    writable: false,
  });

  return copyFnProps(fn, newFn);
}

Layer.prototype.newHandle = undefined;
Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  set(fn) {
    this.newHandle = wrap(fn);
  },
  get() {
    return this.newHandle;
  },
});

const originalParam = Router.prototype.constructor.param;
Router.prototype.constructor.param = function param(name: string, fn: RequestParamHandler) {
  return originalParam.call(this, name, wrap(fn));
};

// override Route[method] function
['all', 'get', 'post', 'put', 'delete', 'patch'].forEach((method: TMethod) => {
  const original = Route.prototype[method];
  Route.prototype[method] = function (...args: any[]) {
    const [schema] = args;
    if (typeof schema === 'object') {
      this.schema = schema;
      // eslint-disable-next-line no-param-reassign
      args[0] = (req: Request, res: Response, next: NextFunction) => {
        requestValidator(req, schema);
        next();
      };
    }
    return original.apply(this, args);
  };
});

export default Router as (options?: RouterOptions) => IValidatorRouter;

import { Express } from 'express';

import { TEndPoint, TMethod, TDocSchema } from './types';

const regexpExpressRegexp = /^\/\^\\\/(?:(:?[\w\\.-]*(?:\\\/:?[\w\\.-]*)*)|(\(\?:\(\[\^\\\/]\+\?\)\)))\\\/.*/;
const regexpExpressParam = /\(\?:\(\[\^\\\/]\+\?\)\)/g;

const STACK_ITEM_VALID_NAMES = ['router', 'bound dispatch'];

const getRouteMethods = (route: any) =>
  Object.keys(route.methods)
    .filter((method: string) => method !== '_all')
    .map((method: string) => method.toLowerCase()) as TMethod[];

const parseExpressRoute = (route: any, basePath?: string): TEndPoint => ({
  path: `${basePath}${basePath && route.path === '/' ? '' : route.path}`,
  methods: getRouteMethods(route),
  schema: route.schema as TDocSchema<any>,
});

const parseExpressPath = (expressPathRegexp: string, params: any) => {
  let paramIdx = 0;
  let parsedRegexp = expressPathRegexp;
  let parsedPath = regexpExpressRegexp.exec(expressPathRegexp);

  while (regexpExpressParam.test(parsedRegexp)) {
    const paramId = `:${params[paramIdx].name}`;
    parsedRegexp = parsedRegexp.toString().replace(/\(\?:\(\[\^\\\/]\+\?\)\)/, paramId);
    paramIdx += 1;
  }

  if (parsedRegexp !== expressPathRegexp) parsedPath = regexpExpressRegexp.exec(parsedRegexp);

  return parsedPath[1].replace(/\\\//g, '/');
};

export const getEndPoints = (exp: Express, basePath?: string, endpoints?: TEndPoint[]): TEndPoint[] => {
  // eslint-disable-next-line no-param-reassign
  endpoints = endpoints || [];
  const newBasePath = basePath || '';
  // eslint-disable-next-line no-underscore-dangle
  const stack = exp.stack || exp._router?.stack;

  stack?.forEach((stackItem: any) => {
    if (stackItem.route) {
      const endPoint = parseExpressRoute(stackItem.route, basePath);
      endpoints.push(endPoint);
    } else if (STACK_ITEM_VALID_NAMES.indexOf(stackItem.name) > -1) {
      if (regexpExpressRegexp.test(stackItem.regexp)) {
        const parsedPath = parseExpressPath(stackItem.regexp, stackItem.keys);
        getEndPoints(stackItem.handle, `${newBasePath}/${parsedPath}`, endpoints);
      } else {
        getEndPoints(stackItem.handle, newBasePath, endpoints);
      }
    }
  });

  return endpoints;
};

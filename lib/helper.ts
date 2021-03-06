import * as pathToRegexp from 'path-to-regexp';

export const requestKeyMap = {
  cookies: 'cookie' as const,
  header: 'header' as const,
  params: 'path' as const,
  query: 'query' as const,
  body: 'body' as const,
};

export const routePathToSwaggerPath = (routePath: string): string =>
  pathToRegexp
    .parse(routePath)
    .map((token) => {
      if (typeof token === 'string') return token;
      if (token.pattern === '[^\\/#\\?]+?') return `${token.prefix}{${token.name}}${token.suffix}`;
      return `${token.prefix}${token.name}${token.suffix}`;
    })
    .join('');

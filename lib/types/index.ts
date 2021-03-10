import { JSONSchemaType } from 'ajv';
import {
  Application,
  IRouterMatcher,
  ParamsDictionary,
  PathParams,
  RequestHandler,
  RequestHandlerParams,
  // eslint-disable-next-line import/no-unresolved
} from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { IRouter } from 'express';
import { TObject, TProperties } from '@serverless-seoul/typebox';

import { requestKeyMap } from '../helper';

export type TMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch';

export type TRoutesKey = keyof typeof requestKeyMap;
export type TParametersKey = Exclude<TRoutesKey, 'body'>;

export type TJSONSchema<T extends Record<string, any>> = {
  [K in keyof T]: JSONSchemaType<T[K]> & { description?: string };
};

export type TDocSchema<T extends Partial<Record<TRoutesKey, any>>> = {
  summary: string;
  additionalProperties?: boolean;
  description?: string;
  tags?: string[];
} & {
  [K in TRoutesKey]?: TJSONSchema<T[K]> | TObject<TProperties>;
};

export type TEndPoint = { path: string; methods: TMethod[]; schema: TDocSchema<any> };

export interface IValidatorRouterMatcher<
  T,
  Method extends 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' = any
> extends IRouterMatcher<T, Method> {
  <
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>
  >(
    path: PathParams,
    docSchema?: TDocSchema<any>,
    // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
    ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
  ): T;
  <
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>
  >(
    path: PathParams,
    // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
    ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>>
  ): T;
  (path: PathParams, subApplication: Application): T;
}

export interface IValidatorRouter extends IRouter {
  all: IValidatorRouterMatcher<this, 'all'>;
  get: IValidatorRouterMatcher<this, 'get'>;
  post: IValidatorRouterMatcher<this, 'post'>;
  put: IValidatorRouterMatcher<this, 'put'>;
  delete: IValidatorRouterMatcher<this, 'delete'>;
  patch: IValidatorRouterMatcher<this, 'patch'>;
}

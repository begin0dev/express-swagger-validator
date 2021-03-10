import { JSONSchemaType } from 'ajv';
import { TObject, TProperties } from '@serverless-seoul/typebox';
import { IRouter as IOriginRouter } from 'express';

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

export interface IRouter extends IOriginRouter {

}

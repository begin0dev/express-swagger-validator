import { JSONSchemaType } from 'ajv';
import { TObject, TProperties } from '@serverless-seoul/typebox';

import { requestKeyMap } from '../helper';

export type RoutesKey = keyof typeof requestKeyMap;
export type ParametersKey = Exclude<RoutesKey, 'body'>;

export type JSONSchema<T extends Record<string, any>> = {
  [K in keyof T]: JSONSchemaType<T[K]> & { description?: string };
};

export type DocSchema<T extends Partial<Record<RoutesKey, any>>> = {
  summary: string;
  additionalProperties?: boolean;
  description?: string;
  tags?: string[];
} & {
  [K in RoutesKey]?: JSONSchema<T[K]> | TObject<TProperties>;
};

export type EndPoint = { path: string; methods: string[]; schema: DocSchema<any> };

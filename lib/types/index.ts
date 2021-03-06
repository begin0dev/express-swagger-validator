import { TObject } from '@serverless-seoul/typebox';

import { requestKeyMap } from '../helper';

export type RoutesKey = keyof typeof requestKeyMap;
export type ParametersKey = Exclude<RoutesKey, 'body'>;

export type DocSchema<T extends Partial<Record<RoutesKey, any>>> = {
  [K in RoutesKey]?: TObject<T[K]>;
} & {
  summary: string;
  additionalProperties?: boolean;
  description?: string;
  tags?: string[];
};

export type EndPoint = { path: string; methods: string[]; schema: DocSchema<any> };

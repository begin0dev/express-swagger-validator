import { Request } from 'express';
import Ajv, { DefinedError } from 'ajv';
import addFormats from 'ajv-formats';

import { TDocSchema, TRoutesKey } from './types';
import { requestKeyMap } from './helper';

export class ValidationError extends Error {
  status = 400;
  details: DefinedError;

  constructor(error: DefinedError) {
    super(error.message);
    this.details = error;
  }
}

const ajv = new Ajv({ useDefaults: true, strict: false });
addFormats(ajv);

export const requestValidator = (req: Request, docSchema: TDocSchema<any>) => {
  const { additionalProperties } = docSchema;

  Object.keys(requestKeyMap).forEach((key: TRoutesKey) => {
    if (!docSchema[key]) return;

    const keySchema = { ...docSchema[key], additionalProperties };
    const validate = ajv.compile(keySchema);
    if (!validate(req[key])) {
      validate.errors.forEach((error: DefinedError) => {
        throw new ValidationError(error);
      });
    }
  });
};

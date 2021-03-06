import { Request } from 'express';
import Ajv, { DefinedError } from 'ajv';

import { DocSchema, RoutesKey } from './types';
import { requestKeyMap } from './helper';

export class ValidationError extends Error {
  status = 400;
  details: DefinedError;

  constructor(error: DefinedError) {
    super(error.message);
    this.details = error;
  }
}

export const requestValidator = (req: Request, docSchema: DocSchema<any>) => {
  const { additionalProperties } = docSchema;
  const ajv = new Ajv({ useDefaults: true });

  Object.keys(requestKeyMap).forEach((key: RoutesKey) => {
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

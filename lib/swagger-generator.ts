import * as OpenApi from 'openapi3-ts';
import { Express } from 'express';
import swaggerUi, { SwaggerOptions } from 'swagger-ui-express';
import { TObject, TSchema } from '@serverless-seoul/typebox';

import { routePathToSwaggerPath, requestKeyMap } from './helper';
import { getEndPoints } from './end-points';
import { ParametersKey } from './types';

interface ISwaggerOptions {
  info: OpenApi.InfoObject;
  servers?: OpenApi.ServerObject[];
  security?: OpenApi.SecurityRequirementObject[];
}

class SwaggerGenerator {
  openApiJSON: OpenApi.OpenAPIObject;

  constructor({ info, servers }: ISwaggerOptions) {
    this.openApiJSON = {
      openapi: '3.0.1',
      info,
      servers,
      tags: [],
      paths: {},
    };
  }

  generatorOpenApiJSON = (app: Express) => {
    const endPoints = getEndPoints(app);

    endPoints.forEach((endPoint) => {
      const routePath = routePathToSwaggerPath(endPoint.path);

      const { additionalProperties, body, description, summary, tags, ...parameters } = endPoint.schema || {};
      const pathsObject: OpenApi.OperationObject = {
        description,
        summary,
        tags,
        responses: {},
      };

      // set openapi parameter 'cookie', 'header', 'path', 'query'
      if (Object.keys(parameters).length > 0) {
        pathsObject.parameters = Object.entries(parameters).reduce(
          (acc: OpenApi.ParameterObject[], [requestKey, keySchema]: [ParametersKey, TObject<any>]) =>
            acc.concat(
              Object.entries(keySchema.properties).map(
                ([name, { description: schemaDesc, ...schema }]: [
                  string,
                  TSchema,
                ]): OpenApi.ParameterObject => ({
                  name,
                  in: requestKeyMap[requestKey],
                  description: schemaDesc,
                  required: (keySchema.required || []).includes(name),
                }),
              ),
            ),
          [],
        );
      }
      console.log(pathsObject);
    });
  };

  setSwaggerUi = (path: string, app: Express, options?: SwaggerOptions) => {
    app.use(path, swaggerUi.serve, swaggerUi.setup(this.openApiJSON, options));
  };
}

export default SwaggerGenerator;

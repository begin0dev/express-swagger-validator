import * as OpenApi from 'openapi3-ts';
import { Express } from 'express';
import swaggerUi, { SwaggerOptions } from 'swagger-ui-express';
import { setWith } from 'lodash';

import { routePathToSwaggerPath, requestKeyMap } from './helper';
import { getEndPoints } from './end-points';
import { ParametersKey, DocSchema } from './types';

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
      const pathsObject: OpenApi.OperationObject = { responses: {} };
      if (summary) pathsObject.summary = summary;
      if (description) pathsObject.description = description;
      if (tags) pathsObject.tags = tags;

      // set openapi parameter 'cookie', 'header', 'path', 'query'
      if (Object.keys(parameters).length > 0) {
        pathsObject.parameters = Object.entries(parameters).reduce(
          (
            acc: OpenApi.ParameterObject[],
            [requestKey, requestKeySchema]: [ParametersKey, DocSchema<any>[ParametersKey]],
          ) =>
            acc.concat(
              Object.entries(requestKeySchema.properties).map(
                // TODO: any 고치고 싶다
                ([name, { description: schemaDesc, kind, ...schema }]: [string, any]): OpenApi.ParameterObject => ({
                  name,
                  schema,
                  in: requestKeyMap[requestKey],
                  description: schemaDesc,
                  required: (requestKeySchema.required || []).includes(name),
                }),
              ),
            ),
          [],
        );
      }

      if (body) {
        const { required, properties } = body;
        pathsObject.requestBody = {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: properties as OpenApi.SchemaObject,
                required: (required || []) as string[],
              },
            },
          },
          required: true,
        };
      }

      endPoint.methods.forEach((method) => {
        this.openApiJSON.paths = setWith(this.openApiJSON.paths, [routePath, method], pathsObject, Object);
      });
    });
  };

  setSwaggerUi = (path: string, app: Express, options?: SwaggerOptions) => {
    this.generatorOpenApiJSON(app);
    app.use(path, swaggerUi.serve, swaggerUi.setup(this.openApiJSON, options));
  };
}

export default SwaggerGenerator;

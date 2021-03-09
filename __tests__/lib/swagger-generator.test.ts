import express, { Request, Response } from 'express';
import { Type } from '@serverless-seoul/typebox';

import validationRouter from '../../lib/validation-router';
import SwaggerGenerator from '../../lib/swagger-generator';

describe('ApiRouter', () => {
  test('generator doc express all routes', async () => {
    const callback = (req: Request, res: Response) => {
      res.send();
    };

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const router = validationRouter();
    router.get('/', callback);
    router.post(
      '/',
      {
        // @ts-ignore
        summary: '테스트용',
        params: Type.Object({ id: Type.String({ description: '테스트용 아이디' }) }),
      },
      callback,
    );
    router.put('/:id', callback);

    app.use('/api/v1/tests', router);

    const swagger = new SwaggerGenerator({ info: { title: 'test', version: '1.0.0' } });

    expect(Object.keys(swagger.openApiJSON.paths).length).toBe(0);

    swagger.generatorOpenApiJSON(app);

    expect(swagger.openApiJSON.paths['/api/v1/tests'].get).not.toBeNull();
    expect(swagger.openApiJSON.paths['/api/v1/tests'].post.parameters.length).toBe(1);
    expect(swagger.openApiJSON.paths['/api/v1/tests/{id}'].put).not.toBeNull();
  });
});

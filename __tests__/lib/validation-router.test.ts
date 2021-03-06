import express, { Request, Response, NextFunction } from 'express';
import { agent } from 'supertest';
import { Type } from '@serverless-seoul/typebox';

import validationRouter from '../../lib/validation-router';
import { ValidationError } from '../../lib/validator';

describe('ApiRouter', () => {
  const message = 'async error test';
  const asyncError = async () => {
    throw new Error(message);
  };

  test('generator doc express all routes', async () => {
    const callback = (req: Request, res: Response) => {
      res.send();
    };

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const router = validationRouter();
    router.post(
      '/test',
      {
        // @ts-ignore
        summary: '테스트용',
        body: Type.Object({ email: Type.String({ format: 'email', description: '테스트용 아이디' }) }),
      },
      callback,
    );
    router.get('/test', callback);
    router.get('/async', async () => {
      await asyncError();
    });

    app.use('/api/v1', router);

    // eslint-disable-next-line no-unused-vars
    app.use((err: ValidationError, req: Request, res: Response, next: NextFunction) => {
      res.status(err?.status || 500).json({ message: err.message });
    });

    await agent(app).get('/api/v1/test').expect(200);
    await agent(app).get('/api/v1/async').expect(500, { message });
    await agent(app).post('/api/v1/test').expect(400);
    await agent(app).post('/api/v1/test').send({ email: 'test' }).expect(400);
    await agent(app).post('/api/v1/test').send({ email: 'test@email.com' }).expect(200);
  });
});

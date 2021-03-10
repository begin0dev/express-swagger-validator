# Express-swagger-validator

이 라이브러리는 Express 라우터의 비동기 에러를 핸들링을 기본으로 적용해주며  
Request 의 벨리데이션을 지원하며 Swagger ui의 문서를 생성해주도록 설계 하였습니다.

### 설치

```
npm i express-swagger-validator
```

### 비동기 에러 핸들링

```ts
import express from 'express';

import aController, { ValidationError } from './a.controller';

const app = express();

app.use(aController);

// 비동기 에러 핸들링
app.use((err: ValidationError, req: Request, res: Response, next: NextFunction) => {
  res.status(err?.status || 500).json({ message: err.message });
});
```

```ts
// a.controller.ts
import { Router } from 'express-swagger-validator';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  // 비동기 에러시 next(err) 동작
  // try catch 로 감싸지 않아도 됩니다.
});

export default router;
```

### Request 벨리데이션

`ajv`를 이용하여 내부 라우터에서 벨리데이션을 처리하며 email 등 포맷을 지원하기 위해서 `ajv-formats` 를 셋팅해두었습니다.

사용 방식은 두가지로 가능합니다. 두번째 인자에만 적용 가능합니다.

1. `jsonschema` 를 직접 작성하는 방법
2. `@serverless-seoul/typebox` 를 사용해서 작성하는 방법

```
npm i @serverless-seoul/typebox
```

```ts
import express from 'express';

import aController, { ValidationError } from './a.controller';

const app = express();

app.use(aController);

// 비동기 에러 핸들링
app.use((err: ValidationError, req: Request, res: Response, next: NextFunction) => {
  // 비동기 에러의 status 는 400
  // 필수 파라미터가 없거나 알맞지 않으면 400 으로 전달됩니다.
  res.status(err?.status || 500).json({ message: err.message });
});
```

```ts
// a.controller.ts

import { Router } from 'express-swagger-validator';
import { Type } from '@serverless-seoul/typebox';

const router = Router();

// 1. jsonschema
router.post(
  '/',
  {
    summary: 'jsonschem',
    body: {
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: { type: 'string', description: 'bar에 대한 설명' },
      },
      required: ['foo'],
    },
    additionalProperties: false,
  },
  (req: Request, res: Response, next: NextFunction) => {
    // api code
  },
);

// 2. typebox
router.post(
  '/',
  {
    summary: 'typebox',
    body: Type.Object({
      foo: Type.String(),
      bar: Type.Optional(Type.String({ description: 'bar에 대한 설명' })),
    }),
    additionalProperties: false,
  },
  (req: Request, res: Response, next: NextFunction) => {
    // api code
  },
);

export default router;
```

### 스웨거 문서 생성

express 의 route 를 탐색하여 문서를 생성해줍니다.  
Router 를 이용해서 두번째 인자로 문서의 설명 및 schema 를 채울수있습니다.

```ts
import express from 'express';

import { SwaggerGenerator } from 'express-swagger-validator';

const app = express();

const swagger = new SwaggerGenerator({ app, info: { title: 'api test', version: '1.0.0' } });

swagger.setSwaggerUi('/api-doc', {
  /* swagger ui options */
});

// ...
```

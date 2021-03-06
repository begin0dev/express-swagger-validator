import express, { Request, Response, NextFunction } from "express";
import { agent } from "supertest";

import validationRouter from "../../lib/validation-router";

describe("ApiRouter", () => {
  const message = "async error test";
  const asyncError = async () => {
    throw new Error(message);
  };

  test("generator doc express all routes", async () => {
    const callback = (req: Request, res: Response) => {
      res.send();
    };

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const router = validationRouter();
    router.get("/test", callback);
    router.get("/async", async () => {
      await asyncError();
    });

    app.use("/api/v1", router);

    // eslint-disable-next-line no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(500).json({ message: err.message });
    });

    await agent(app).get("/api/v1/test").expect(200);
    await agent(app).get("/api/v1/async").expect(500, { message });
  });
});

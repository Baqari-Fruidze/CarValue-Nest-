import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import cookieSession from 'cookie-session';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

describe('authentication system (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const dbFile = process.env.DB_PATH || 'testDb.sqlite';
    const dbPath = join(process.cwd(), dbFile);

    if (existsSync(dbPath)) rmSync(dbPath, { force: true });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(
      cookieSession({
        keys: ['kone'],
      }),
    );
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('handles a sign up requst', () => {
    const email = `test${Date.now()}@test.com`;
    return request(app.getHttpServer())
      .post(`/auth/signup`)
      .send({ email, password: 'sdssa' })
      .expect(201)
      .then((res) => {
        const { id, email: responseEmail } = res.body;
        expect(id).toBeDefined();
        expect(responseEmail).toEqual(email);
      });
  });
  it(`sign upp a new user then get current user`, async () => {
    const email = 'adsa@gmail.com';
    const password = 'password';
    const res = await request(app.getHttpServer())
      .post(`/auth/signup`)
      .send({ email, password })
      .expect(201);
    const cookie = res.get(`Set-Cookie`) as string[];
    const { body } = await request(app.getHttpServer())
      .get(`/auth/whoami`)
      .set(`Cookie`, cookie)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});

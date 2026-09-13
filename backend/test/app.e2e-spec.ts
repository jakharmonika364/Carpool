import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';

describe('Auth + Users (e2e)', () => {
  let app: INestApplication;

  const password = 'SecurePassword123!';
  const email = `test-${randomUUID()}@university.edu`;
  const phoneNumber = `+9190${Math.floor(10000000 + Math.random() * 89999999)}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects registration with an invalid email (422)', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        fullName: 'Test Student',
        email: 'not-an-email',
        phoneNumber,
        password,
      });

    expect(response.status).toBe(422);
    expect(response.body.code).toBeDefined();
    expect(response.body.requestId).toBeDefined();
  });

  it('registers a new student', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        fullName: 'Test Student',
        email,
        phoneNumber,
        password,
      });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('rejects registration with a duplicate email (409)', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        fullName: 'Duplicate Student',
        email,
        phoneNumber: `+9190${Math.floor(10000000 + Math.random() * 89999999)}`,
        password,
      });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CONFLICT');
  });

  it('rejects login with an incorrect password (401)', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password: 'WrongPassword123!' });

    expect(response.status).toBe(401);
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it('rejects access to a protected endpoint without a token (401)', async () => {
    const response = await request(app.getHttpServer()).get('/v1/users/me');
    expect(response.status).toBe(401);
  });

  it('returns the authenticated user profile', async () => {
    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password });
    const accessToken = login.body.accessToken;

    const response = await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(email);
  });

  it('updates only the authenticated user profile', async () => {
    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password });
    const accessToken = login.body.accessToken;

    const response = await request(app.getHttpServer())
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fullName: 'Updated Student Name' });

    expect(response.status).toBe(200);
    expect(response.body.fullName).toBe('Updated Student Name');
    expect(response.body.email).toBe(email);
  });

  it('rejects a token after logout', async () => {
    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password });
    const accessToken = login.body.accessToken;

    const logoutResponse = await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logoutResponse.status).toBe(200);

    const meResponse = await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meResponse.status).toBe(401);
  });
});

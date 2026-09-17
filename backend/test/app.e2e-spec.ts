import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { User } from '../src/database/entities/user.entity';

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

    const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const passwordHash = await bcrypt.hash(password, 4);
    await usersRepository.save(
      usersRepository.create({
        fullName: 'Test Student',
        email,
        phoneNumber,
        passwordHash,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
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

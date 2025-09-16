import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/controller/user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST', 'localhost'),
            port: +configService.get<number>('DB_PORT', 5432),
            username: configService.get('DB_USERNAME', 'postgres'),
            password: configService.get('DB_PASSWORD', 'postgres'),
            database: configService.get('DB_NAME', 'user_service_test'),
            entities: [User],
            synchronize: true,
            dropSchema: true,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/user')
      .send({
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('test@example.com');
    userId = response.body.id;
  });

  it('should login with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should get user profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', userId);
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  it('should update user preferences', async () => {
    const preferences = {
      notifications: true,
      language: 'en',
      timezone: 'UTC'
    };

    const response = await request(app.getHttpServer())
      .patch('/user/preferences')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(preferences)
      .expect(200);

    expect(response.body.preferences).toEqual(preferences);
  });

  it('should change password', async () => {
    await request(app.getHttpServer())
      .patch('/user/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmNewPassword: 'newpassword123',
      })
      .expect(200);
  });

  it('should request password reset', async () => {
    await request(app.getHttpServer())
      .post('/user/reset-password')
      .send({ email: 'test@example.com' })
      .expect(202);
  });

  it('should refresh access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/refresh-token')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should logout user', async () => {
    await request(app.getHttpServer())
      .post('/user/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});

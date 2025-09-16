import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { parse } from 'pg-connection-string';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '104.248.33.84', // Using IP address instead of hostname
      port: 20908,
      username: 'avnadmin',
      password: 'AVNS_DDb72Mo47dIsPCalXf_',
      database: 'defaultdb',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl: {
        rejectUnauthorized: false
      },
      extra: {
        ssl: {
          rejectUnauthorized: false
        }
      },
    }),
  ],
})
export class DatabaseModule {}

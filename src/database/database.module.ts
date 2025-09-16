import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { parse } from 'pg-connection-string';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Usar DATABASE_URL o la URL de conexión proporcionada
        const databaseUrl = configService.get<string>('DATABASE_URL', 'postgres://avnadmin:AVNS_DDb72Mo47dIsPCalXf_@motoriders-hub-adrarom-0617.g.aivencloud.com:20908/defaultdb?sslmode=require');
        const config = parse(databaseUrl);
        
        return {
          type: 'postgres',
          host: config.host || 'localhost',
          port: parseInt(config.port || '5432', 10),
          username: config.user || 'postgres',
          password: config.password || 'postgres',
          database: config.database || 'defaultdb',
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
          ssl: {
            rejectUnauthorized: false, // Necesario para conexiones con SSL
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}

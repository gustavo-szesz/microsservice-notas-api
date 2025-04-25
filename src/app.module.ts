import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotasModule } from './notas/notas.module';
import { CacheModule } from './cache/cache.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/notas'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }),
    }),
    NotasModule, CacheModule, IntegrationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

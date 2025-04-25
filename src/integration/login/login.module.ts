import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../../cache/cache.module';
import { CircuitBreakerModule } from '../circuit-breaker/circuit-breaker.module';
import { RetryModule } from '../retry/retry.module';
import { LoginService } from './login.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
    CacheModule,
    CircuitBreakerModule,
    RetryModule,
  ],
  providers: [LoginService],
  exports: [LoginService]
})
export class LoginModule {}

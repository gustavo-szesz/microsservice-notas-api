import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../cache/cache.module';
import { LoginModule } from './login/login.module';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';
import { RetryModule } from './retry/retry.module';

@Module({
  imports: [
    // Import HttpModule at this level to make HttpService available to all submodules
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
    CacheModule,
    CircuitBreakerModule,
    RetryModule,
    LoginModule,
  ],
  exports: [
    // Re-export all modules for use elsewhere in the application
    HttpModule,
    CircuitBreakerModule,
    RetryModule,
    LoginModule,
  ]
})
export class IntegrationModule {}
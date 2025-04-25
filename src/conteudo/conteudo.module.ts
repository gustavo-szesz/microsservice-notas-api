import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ConteudoService } from './conteudo.service';
import { CacheModule } from '../cache/cache.module';
import { CircuitBreakerModule } from '../integration/circuit-breaker/circuit-breaker.module';
import { RetryModule } from '../integration/retry/retry.module';

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
  providers: [ConteudoService],
  exports: [ConteudoService]
})
export class ConteudoModule {}

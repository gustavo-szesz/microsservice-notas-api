import { Module } from '@nestjs/common';
import { RetryService } from './retry/retry.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';

@Module({
  providers: [RetryService, CircuitBreakerService],
  imports: [CircuitBreakerModule]
})
export class IntegrationModule {}

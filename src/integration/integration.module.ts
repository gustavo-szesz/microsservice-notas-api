import { Module } from '@nestjs/common';
import { RetryService } from './retry/retry.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';

@Module({
  providers: [RetryService, CircuitBreakerService]
})
export class IntegrationModule {}

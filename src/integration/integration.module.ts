import { Module } from '@nestjs/common';
import { RetryService } from './retry/retry.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';
import { LoginService } from './login/login.service';
import { LoginModule } from './login/login.module';

@Module({
  providers: [RetryService, CircuitBreakerService, LoginService],
  imports: [CircuitBreakerModule, LoginModule]
})
export class IntegrationModule {}

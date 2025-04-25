import { Injectable, Logger } from '@nestjs/common';
import { CircuitBreaker, CircuitBreakerOptions } from 'opossum';

@Injectable()
export class CircuitBreakerService {
    private readonly logger = new Logger(CircuitBreakerService.name);
    private readonly breakers: Map<string, CircuitBreaker> = new Map();

    // cria ou retorna um CircuitBreaker
    getBreaker(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker {
        if (this.breakers.has(serviceName)) {
            const defaultOptions: CircuitBreaker = {
                timeout: 3000, // 3 segundos 
                errorThresholdPercentage: 50,   // 50% de falhas para abrir o circuito
                resetTimeout: 10000,            // 10 segundos para fechar o circuito
                rollingCountTimeout: 60000,     // 60 segundos para contar as falhas
                rollingCountBuckets: 10,        // Dividir o tempo de contagem em 10 buckets
                ...options,
            };

            const breaker = new CircuitBreaker(async (fn) => fn(), defaultOptions);

            breaker.on('open', () => {
                this.logger.warn(`Circuit breaker for ${serviceName} is open`);
            });

            breaker.on('close', () => {
                this.logger.log(`Circuit breaker for ${serviceName} is closed`);
            });

            breaker.on('halfOpen', () => {
                this.logger.log(`Circuit breaker for ${serviceName} is half open`);
            });

            breaker.on('failback', (result) => {
                this.logger.error(`Circuit breaker for ${serviceName} failed: ${result}`);
            });

            this.breakers.set(serviceName, breaker);
        }

        return this.breakers.get(serviceName);
    }

    // executa uma função com o CircuitBreaker
    async execute<T>(
        serviceName: string,
        fn: () => Promise<T>,
        failBackFn?: () => Promise<T>,
        options?: CircuitBreakerOptions
    ): Promise<T> {
        const breaker = this.getBreaker(serviceName, options);

        if (failBackFn) {
            breaker.failback(failBackFn);
        }

        return breaker.fire(() => fn())
    }

}
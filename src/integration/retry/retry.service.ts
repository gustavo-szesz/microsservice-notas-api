import { Injectable, Logger } from '@nestjs/common';
import { retry } from 'rxjs/operators';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class RetryService {
    private readonly logger = new Logger(RetryService.name);

    /**
     * Configuração de retry com backoff exponencial
     * @param maxRetries Número máximo de tentativas
     * @param initialDelayMs Delay inicial em milissegundos
     * @param maxDelayMs Delay máximo em milissegundos
     * @param scalingFactor Fator de escala para o backoff exponencial
     */
    getRetryBackoffStrategy(
        maxRetries = 3,
        initialDelayMs = 1000,
        maxDelayMs = 10000,
        scalingFactor = 2,
    ){
        return (attempts: Observable<any>) => {
            return attempts.pipe(
                mergeMap((error, index) => {
                    const retryAttempt = index + 1;
    
                    // Se passar do numero maximo de tentativas, lança o erro
                    if (retryAttempt > maxRetries) {
                        this.logger.error('Max retries exceeded', error);
                        return throwError(() => error);
                    }


                    // calcular o delay com backoff exponencial
                    const delay = Math.min(
                        maxDelayMs,
                        initialDelayMs * Math.pow(scalingFactor, retryAttempt - 1)
                    );

                    this.logger.warn(`Retry attempt ${retryAttempt} in ${delay}ms failed.
                        Retrying in ${delay}ms...`, error);

                    return timer(delay);
                }),
                
            )

        }
    }
}

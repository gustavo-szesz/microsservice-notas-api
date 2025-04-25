import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { IConteudo } from '../notas/interfaces/nota.interface';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ConteudoService {
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly cacheService: CacheService
    ) {
        this.baseUrl = this.configService.get<string>('CONTEUDO_SERVICE_URL',
            'http://conteudo-service:3000/conteudo'
        );
    }

    async getConteudo(conteudoId: string): Promise<IConteudo> {
        // Verifica se o conteúdo está no cache
        const cachedConteudo = await this.cacheService.getContent(conteudoId);
        if (cachedConteudo) {
            return cachedConteudo;
        }
        // Se não estiver no cache, faz a requisição
        try {
            const { data } = await firstValueFrom(
                this.httpService.get<IConteudo>(`${this.baseUrl}/api/conteudos/${conteudoId}`)
                .pipe(
                    catchError((error) => {
                      if (error.response?.status === 404) {
                        throw new HttpException('Content not found',
                            HttpStatus.NOT_FOUND);
                      }
                      throw new HttpException('Error on comunication with content service',
                        HttpStatus.SERVICE_UNAVAILABLE);
                    }),
                  ),
                );

            // Armazena o conteúdo no cache
            await this.cacheService.setContent(conteudoId, data);
            return data;
        } catch (error) {
            throw error;
        }
    }


    async verifyContentExistent(conteudoId: string): Promise<boolean> {
        try {
            await this.getConteudo(conteudoId);
            return true;
        } catch (error) {
            if (error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND) {
                return false;
            }
            throw new HttpException('Err on verifying content',
                error);
        }
    }

}

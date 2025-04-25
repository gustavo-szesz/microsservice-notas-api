import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { IUsuario } from '../../notas/interfaces/nota.interface';
import { CacheService } from '../../cache/cache.service';


@Injectable()
export class LoginService {
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly cacheService: CacheService,
    ) {
        this.baseUrl = this.configService.get<string>('LOGIN_SERVICE_URL', 
            'http://login-service:8080');
    }

    async getUsuario(usuarioId: string): Promise<IUsuario> {
        // checar se o usuário está no cache
        const cachedUser = await this.cacheService.getUser(usuarioId);
        if (cachedUser) {
            return cachedUser;
        }

        // se não estiver no cache, fazer a requisição
        try {
            const { data } = await firstValueFrom(
                this.httpService.get<IUsuario>(`${this.baseUrl}/api/usuarios/${usuarioId}`).pipe(
                    catchError((error) => {
                        if (error.response?.status === 404) {
                            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
                        }
                    throw new HttpException('Error on comunication with login service',
                         HttpStatus.SERVICE_UNAVAILABLE);
                    }),
                ),
            );

            // armazenar o usuário no cache
            await this.cacheService.setUser(usuarioId, data);
            return data;
        } catch (error) {
            throw error;
        }  
    }

    async verificarUsuarioExiste(usuarioId: string): Promise<boolean> {
        try {
            await this.getUsuario(usuarioId);
            return true;
        } catch (error) {
            if (error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND) {
                return false;
            }
            throw new HttpException('Error on comunication with login service',
             HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}

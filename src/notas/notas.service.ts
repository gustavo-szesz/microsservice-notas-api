import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { FindNotasDto } from './dto/find-nota.dto';
import { CalcularMediaDto } from './dto/calcular-media.dto';
import { Nota, NotaDocument } from './entities/notas.entity';
import { INotaResponse, IMediaResponse } from './interfaces/nota.interface';
import { LoginService } from '../integration/login/login.service';
import { ConteudoService } from '../conteudo/conteudo.service';
import { CircuitBreakerService } from '../integration/circuit-breaker/circuit-breaker.service';
import { RetryService } from '../integration/retry/retry.service';
import { CacheService } from '../cache/cache.service';


@Injectable()
export class NotasService {
    private readonly logger = new Logger(NotasService.name);
    
    constructor(
        @InjectModel(Nota.name) private notaModel: Model<NotaDocument>,
        private loginService: LoginService,
        private conteudoService: ConteudoService,
        private circuitBreakerService: CircuitBreakerService,
        private retryService: RetryService,
        private cacheService: CacheService
    ) {}

    async create(createNotaDto: CreateNotaDto): Promise<INotaResponse> {
        // Verificar se o aluno existe
        try {
        await this.circuitBreakerService.execute(
            'login-service',
            () => this.retryService.executeWithRetry(
            () => this.loginService.verificarUsuarioExiste(createNotaDto.alunoId),
            'login-service'
            ),
            async () => {
            this.logger.warn(`Circuit breaker aberto para login-service. Assumindo que o aluno existe.`);
            return true;
            }
        );
        } catch (error) {
        this.logger.error(`Erro ao verificar existência do aluno: ${error.message}`);
        throw new HttpException('Aluno não encontrado ou serviço indisponível', HttpStatus.NOT_FOUND);
        }

        // Verificar se o conteúdo existe
        try {
        await this.circuitBreakerService.execute(
            'conteudo-service',
            () => this.retryService.executeWithRetry(
            () => this.conteudoService.verificarConteudoExiste(createNotaDto.conteudoId),
            'conteudo-service'
            ),
            async () => {
            this.logger.warn(`Circuit breaker aberto para conteudo-service. Assumindo que o conteúdo existe.`);
            return true;
            }
        );
        } catch (error) {
        this.logger.error(`Erro ao verificar existência do conteúdo: ${error.message}`);
        throw new HttpException('Conteúdo não encontrado ou serviço indisponível', HttpStatus.NOT_FOUND);
        }

        // Verificar se já existe uma nota para este aluno e conteúdo
        const notaExistente = await this.notaModel.findOne({
        alunoId: createNotaDto.alunoId,
        conteudoId: createNotaDto.conteudoId,
        });

        if (notaExistente) {
        throw new HttpException(
            'Já existe uma nota registrada para este aluno e conteúdo',
            HttpStatus.CONFLICT,
        );
        }

        // Criar a nova nota
        const novaNota = new this.notaModel(createNotaDto);
        const notaSalva = await novaNota.save();

        // Invalidar caches relacionados
        await this.cacheService.invalidateStudentCache(createNotaDto.alunoId);
        await this.cacheService.invalidateContentCache(createNotaDto.conteudoId);

        // Armazenar a nova nota em cache
        await this.cacheService.setGrade(notaSalva._id.toString(), notaSalva);

        return notaSalva;
    }

    async findAll(findNotasDto: FindNotasDto): Promise<INotaResponse[]> {
        const { alunoId, conteudoId } = findNotasDto;
        const filtro: any = {};

        if (alunoId) {
            filtro.alunoId = alunoId;
            
            // verifica cache de notas do aluno
            const cachedGradesIds = await this.cacheService.getStudentGrades(alunoId);
            if (cachedGradesIds && !conteudoId) {
                const cachedGrades = await Promise.all(
                    cachedGradesIds.map(async (id) => {
                        const grade = await this.cacheService.getGrade(id);
                        return grade || this.findOne(id);
                    }),
                );
                return cachedGrades.filter(Boolean);
            }
        }

        if (conteudoId) {
            filtro.conteudoId = conteudoId;
            
            // verifica cache de notas do conteudo
            const cachedGradesIds = await this.cacheService.getContentGrades(conteudoId);
            if (cachedGradesIds && !alunoId) {
                const cachedGrades = await Promise.all(
                    cachedGradesIds.map(async (id) => {
                        const grade = await this.cacheService.getGrade(id);
                        return grade || this.findOne(id);
                    }),
                );
                return cachedGrades.filter(Boolean);
            }
        }

        // se não houver cache, busca no banco de dados
        const notas = await this.notaModel.find(filtro).exec();

        // Armazena as notas no cache
        if (alunoId && notas.length > 0) {
            const gradesIds = notas.map((nota) => nota._id.toString());
            await this.cacheService.setStudentGrades(alunoId, gradesIds);

            // Armazena cada nota individualmente no cache
            for (const nota of notas) {
                await this.cacheService.setGrade(nota._id.toString(), nota);
            }

        }
      
    }


    
}

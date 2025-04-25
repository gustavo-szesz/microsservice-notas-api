import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { FindNotasDto } from './dto/find-nota.dto';
import { CalcularMediaDto } from './dto/calcular-media.dto';
import { Nota, NotaDocument } from './entities/notas.entity';
import { Types } from 'mongoose';
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
      private readonly loginService: LoginService,
      private readonly conteudoService: ConteudoService,
      private readonly circuitBreakerService: CircuitBreakerService,
      private readonly retryService: RetryService,
      private readonly cacheService: CacheService,
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
            () => this.conteudoService.verifyContentExistent(createNotaDto.conteudoId),
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
  
      // Converter para o formato esperado
      const notaResponse = this.toINotaResponse(notaSalva);
  
      // Armazenar a nova nota em cache
      await this.cacheService.setGrade(notaResponse._id, notaResponse);
  
      return notaResponse;
    }
  
    async findAll(findNotasDto: FindNotasDto): Promise<INotaResponse[]> {
      const { alunoId, conteudoId } = findNotasDto;
      const filtro: any = {};
  
      if (alunoId) {
        filtro.alunoId = alunoId;
  
        // Verificar cache de notas do aluno
        const cachedGradeIds = await this.cacheService.getStudentGrades(alunoId);
        if (cachedGradeIds && !conteudoId) {
          const cachedGrades = await Promise.all(
            cachedGradeIds.map(async (id) => {
              const grade = await this.cacheService.getGrade(id);
              return grade || this.findOne(id);
            })
          );
          return cachedGrades.filter(Boolean).map(this.toINotaResponse);
        }
      }
  
      if (conteudoId) {
        filtro.conteudoId = conteudoId;
  
        // Verificar cache de notas do conteúdo
        const cachedGradeIds = await this.cacheService.getContentGrades(conteudoId);
        if (cachedGradeIds && !alunoId) {
          const cachedGrades = await Promise.all(
            cachedGradeIds.map(async (id) => {
              const grade = await this.cacheService.getGrade(id);
              return grade || this.findOne(id);
            })
          );
          return cachedGrades.filter(Boolean).map(this.toINotaResponse);
        }
      }
  
      // Se não encontrou em cache, buscar no banco de dados
      const notas = await this.notaModel.find(filtro).exec();
  
      // Armazenar em cache
      if (alunoId && notas.length > 0) {
        const gradeIds = notas.map((nota: NotaDocument) => (nota._id as Types.ObjectId).toString());
        await this.cacheService.setStudentGrades(alunoId, gradeIds);
        
        // Armazenar cada nota individualmente
        for (const nota of notas) {
          await this.cacheService.setGrade((nota._id as Types.ObjectId).toString(), nota);
        }
      }
  
      if (conteudoId && notas.length > 0) {
        const gradeIds = notas.map(nota => (nota._id as Types.ObjectId).toString());
        await this.cacheService.setContentGrades(conteudoId, gradeIds);
      }
  
      return notas.map(this.toINotaResponse);
    }
  
    async findOne(id: string): Promise<INotaResponse> {
        // Verificar cache
        const cachedGrade = await this.cacheService.getGrade(id);
        if (cachedGrade) {
          return this.toINotaResponse(cachedGrade);
        }
    
        // Se não encontrou em cache, buscar no banco de dados
        const nota = await this.notaModel.findById(id).exec();
        if (!nota) {
          throw new HttpException('Nota não encontrada', HttpStatus.NOT_FOUND);
        }
    
        // Armazenar em cache
        await this.cacheService.setGrade(id, nota);
    
        return this.toINotaResponse(nota);
      }
  
    async update(id: string, updateNotaDto: UpdateNotaDto): Promise<INotaResponse> {
      const nota = await this.notaModel.findById(id).exec();
      if (!nota) {
        throw new HttpException('Nota não encontrada', HttpStatus.NOT_FOUND);
      }
  
      // Atualizar a nota
      const notaAtualizada = await this.notaModel.findByIdAndUpdate(
        id,
        { $set: updateNotaDto },
        { new: true },
      ).exec();
      
      // Verificar se a nota foi atualizada com sucesso
      if (!notaAtualizada) {
        throw new HttpException('Falha ao atualizar nota', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  
      // Invalidar caches relacionados
      await this.cacheService.invalidateGrade(id);
      await this.cacheService.invalidateStudentCache(nota.alunoId);
      await this.cacheService.invalidateContentCache(nota.conteudoId);
  
      // Atualizar cache da nota
      await this.cacheService.setGrade(id, notaAtualizada);
  
      return this.toINotaResponse(notaAtualizada);
    }
  
    async remove(id: string): Promise<void> {
      const nota = await this.notaModel.findById(id).exec();
      if (!nota) {
        throw new HttpException('Nota não encontrada', HttpStatus.NOT_FOUND);
      }
  
      await this.notaModel.findByIdAndDelete(id).exec();
  
      // Invalidar caches relacionados
      await this.cacheService.invalidateGrade(id);
      await this.cacheService.invalidateStudentCache(nota.alunoId);
      await this.cacheService.invalidateContentCache(nota.conteudoId);
    }
  
    async calcularMedia(calcularMediaDto: CalcularMediaDto): Promise<IMediaResponse> {
      const { alunoId, conteudoId } = calcularMediaDto;
  
      // Verificar cache de média
      if (alunoId && !conteudoId) {
        const cachedAverage = await this.cacheService.getStudentAverage(alunoId);
        if (cachedAverage !== undefined) {
          return {
            media: cachedAverage,
            totalNotas: await this.notaModel.countDocuments({ alunoId }).exec(),
            alunoId,
          };
        }
      }
  
      if (conteudoId && !alunoId) {
        const cachedAverage = await this.cacheService.getContentAverage(conteudoId);
        if (cachedAverage !== undefined) {
          return {
            media: cachedAverage,
            totalNotas: await this.notaModel.countDocuments({ conteudoId }).exec(),
            conteudoId,
          };
        }
      }
  
      // Construir filtro
      const filtro: any = {};
      if (alunoId) filtro.alunoId = alunoId;
      if (conteudoId) filtro.conteudoId = conteudoId;
  
      // Buscar notas
      const notas = await this.notaModel.find(filtro).exec();
      
      if (notas.length === 0) {
        return {
          media: 0,
          totalNotas: 0,
          alunoId,
          conteudoId,
        };
      }
  
      // Calcular média
      const soma = notas.reduce((acc, nota) => acc + nota.valor, 0);
      const media = soma / notas.length;
  
      // Armazenar em cache
      if (alunoId && !conteudoId) {
        await this.cacheService.setStudentAverage(alunoId, media);
      }
  
      if (conteudoId && !alunoId) {
        await this.cacheService.setContentAverage(conteudoId, media);
      }
  
      return {
        media,
        totalNotas: notas.length,
        alunoId,
        conteudoId,
      };
    }

    private toINotaResponse(nota: NotaDocument): INotaResponse {
      return {
        _id: (nota._id as Types.ObjectId).toString(),
        alunoId: nota.alunoId,
        conteudoId: nota.conteudoId,
        valor: nota.valor,
        dataRegistro : nota.dataRegistro,
        // Inclua outros campos conforme necessário
      };
    }
    
}

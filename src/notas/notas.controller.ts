import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotasService } from './notas.service';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { FindNotasDto } from './dto/find-nota.dto';
import { CalcularMediaDto } from './dto/calcular-media.dto';
import { INotaResponse, IMediaResponse } from './interfaces/nota.interface';

@ApiTags('notas')
@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova nota' })
  @ApiResponse({ status: 201, description: 'Nota registrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Aluno ou conteúdo não encontrado' })
  @ApiResponse({ status: 409, description: 'Nota já existe para este aluno e conteúdo' })
  async create(@Body() createNotaDto: CreateNotaDto): Promise<INotaResponse> {
    return this.notasService.create(createNotaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notas com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de notas retornada com sucesso' })
  @ApiQuery({ name: 'alunoId', required: false, description: 'ID do aluno para filtrar notas' })
  @ApiQuery({ name: 'conteudoId', required: false, description: 'ID do conteúdo para filtrar notas' })
  async findAll(@Query() findNotasDto: FindNotasDto): Promise<INotaResponse[]> {
    return this.notasService.findAll(findNotasDto);
  }

  @Get('media')
  @ApiOperation({ summary: 'Calcular média de notas' })
  @ApiResponse({ status: 200, description: 'Média calculada com sucesso' })
  @ApiQuery({ name: 'alunoId', required: false, description: 'ID do aluno para calcular média' })
  @ApiQuery({ name: 'conteudoId', required: false, description: 'ID do conteúdo para calcular média' })
  async calcularMedia(@Query() calcularMediaDto: CalcularMediaDto): Promise<IMediaResponse> {
    if (!calcularMediaDto.alunoId && !calcularMediaDto.conteudoId) {
      throw new HttpException('É necessário informar pelo menos um filtro: alunoId ou conteudoId', HttpStatus.BAD_REQUEST);
    }
    return this.notasService.calcularMedia(calcularMediaDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma nota pelo ID' })
  @ApiResponse({ status: 200, description: 'Nota encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Nota não encontrada' })
  @ApiParam({ name: 'id', description: 'ID da nota' })
  async findOne(@Param('id') id: string): Promise<INotaResponse> {
    const nota = await this.notasService.findOne(id);
    if (!nota) {
      throw new HttpException('Nota não encontrada', HttpStatus.NOT_FOUND);
    }
    return nota;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma nota pelo ID' })
  @ApiResponse({ status: 200, description: 'Nota atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Nota não encontrada' })
  @ApiParam({ name: 'id', description: 'ID da nota' })
  async update(@Param('id') id: string, @Body() updateNotaDto: UpdateNotaDto): Promise<INotaResponse> {
    return this.notasService.update(id, updateNotaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma nota pelo ID' })
  @ApiResponse({ status: 200, description: 'Nota removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Nota não encontrada' })
  @ApiParam({ name: 'id', description: 'ID da nota' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.notasService.remove(id);
    return { message: 'Nota removida com sucesso' };
  }
}

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindNotasDto {
    @ApiProperty({
      description: 'ID do aluno para filtrar notas',
      example: '60d21b4667d0d8992e610c85',
      required: false
    })
    @IsOptional()
    @IsString()
    alunoId?: string;
  
    @ApiProperty({
      description: 'ID do conteúdo para filtrar notas',
      example: '60d21b4667d0d8992e610c86',
      required: false
    })
    @IsOptional()
    @IsString()
    conteudoId?: string;
  }
  
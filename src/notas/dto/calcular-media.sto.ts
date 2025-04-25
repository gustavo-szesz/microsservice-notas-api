import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalcularMediaDto {
  @ApiProperty({
    description: 'ID do aluno para calcular média',
    example: '60d21b4667d0d8992e610c85',
    required: false
  })
  @IsOptional()
  @IsString()
  alunoId?: string;

  @ApiProperty({
    description: 'ID do conteúdo para calcular média',
    example: '60d21b4667d0d8992e610c86',
    required: false
  })
  @IsOptional()
  @IsString()
  conteudoId?: string;
}

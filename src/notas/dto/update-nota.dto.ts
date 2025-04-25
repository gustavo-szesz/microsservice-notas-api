import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaDto } from './create-nota.dto';

export class UpdateNotaDto extends PartialType(CreateNotaDto) {
    @ApiProperty({
        description: 'Valor da nota do aluno (0 a 10)',
        example: 8.5,
        minimum: 0,
        maximum: 10,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    valor?: number;


    @ApiProperty({
        description: 'Observação da nota',
        example: 'Nota referente ao desempenho pratico',
        required: false,
    })
    @IsOptional()
    @IsString()
    observacao?: string;
}
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotaDto {
    @ApiProperty({
        description: 'ID do aluno no microsserviço de Login',
        example: '60d21b4667d0d8992e610c85'
    })
    @IsNotEmpty()
    @IsString()
    alunoId: string;


    @ApiProperty({
        description: 'ID do conteúdo no microsserviço de Conteúdo',
        example: '60d21b4667d0d8992e610c85'
    })
    @IsNotEmpty()
    @IsString()
    conteudoId: string;

    @ApiProperty({
        description: 'Nota do aluno',
        example: 8.5,
        minimum: 0,
        maximum: 10
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(10)
    valor: number;

    @ApiProperty({
        description: 'Descrição da nota',
        example: 'Nota referente ao teste de matemática',
        required: false
    })
    @IsOptional()
    @IsString()
    observacao?: string;

}
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongoseSchema } from "mongoose";

export type NotasDocument = Notas & Document;

@Schema({
    timestamps: true,
    collection: 'notas',
})
export class Notas {
    @Prop({ required: true })
    alunoId: string;

    @Prop({ required: true })
    conteudoId: string;

    @Prop({ required: true, min: 0, max: 10 })
    nota: number;

    @Prop({ default: ''})
    descricao: string;

    @Prop({ default: Date.now })
    dataRegistro: Date;
}

export const NotasSchema = SchemaFactory.createForClass(Notas);

// Indices para o aluno e conteudo, 
// sem duplicidade
NotasSchema.index({ alunoId: 1});
NotasSchema.index({ conteudoId: 1});
NotasSchema.index({ alunoId: 1, conteudoId: 1}, { unique: true });
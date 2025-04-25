import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotaDocument = Nota & Document;

@Schema({
  timestamps: true,
  collection: 'notas',
})
export class Nota {
  @Prop({ required: true })
  alunoId: string;

  @Prop({ required: true })
  conteudoId: string;

  @Prop({ required: true, min: 0, max: 10 })
  valor: number;

  @Prop({ default: '' })
  observacao: string;

  @Prop({ default: Date.now })
  dataRegistro: Date;
}

export const NotaSchema = SchemaFactory.createForClass(Nota);

// Índices para otimizar consultas
NotaSchema.index({ alunoId: 1 });
NotaSchema.index({ conteudoId: 1 });
NotaSchema.index({ alunoId: 1, conteudoId: 1 }, { unique: true });
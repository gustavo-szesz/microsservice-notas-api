import { Document } from 'mongoose';

export interface INota {
  _id?: string;
  alunoId: string;
  conteudoId: string;
  valor: number;
  observacao?: string;
  dataRegistro: Date;
}

export interface INotaResponse extends INota {
  _id: string;
  
}

export interface IMediaResponse {
  media: number;
  totalNotas: number;
  alunoId?: string;
  conteudoId?: string;
}

export interface IUsuario {
  id: string;
  nome: string;
  email: string;
}

export interface IConteudo {
  id: string;
  titulo: string;
  curso: string;
  descricao?: string;
  unidade?: string;
}

import { Module } from '@nestjs/common';
import { ConteudoService } from './conteudo.service';

@Module({
  providers: [ConteudoService]
})
export class ConteudoModule {}

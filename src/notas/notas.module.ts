import { Module } from '@nestjs/common';
import { NotasService } from './notas.service';
import { NotasController } from './notas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationModule } from '../integration/integration.module';
import { CacheModule } from '../cache/cache.module';
import { Nota, NotaSchema } from './entities/notas.entity';
import { ConteudoModule } from '../conteudo/conteudo.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Nota.name, schema: NotaSchema },
    ]),
    IntegrationModule,
    CacheModule,
    ConteudoModule, // Adicionando o ConteudoModule para fornecer o ConteudoService
  ],
  controllers: [NotasController],
  providers: [NotasService],
  exports: [NotasService],
})
export class NotasModule {}

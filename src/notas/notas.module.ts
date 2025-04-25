import { Module } from '@nestjs/common';
import { NotasService } from './notas.service';
import { NotasController } from './notas.controller';
import { Mongoose } from 'mongoose';
import { IntegrationModule } from 'src/integration/integration.module';
import { CacheModule } from 'src/cache/cache.module';
import { Nota, NotaSchema } from './entities/notas.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Nota.name , schema: NotaSchema },
    ]),
    IntegrationModule,
    CacheModule,
  ],
  controllers: [NotasController],
  providers: [NotasService],
  exports: [NotasService],
})
export class NotasModule {}

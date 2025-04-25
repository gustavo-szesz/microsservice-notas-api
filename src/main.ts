import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // segurança e perfomance
  //app.use(helmet());
  app.use(compression());
  app.enableCors();


  // validacao global de DTO's
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // prefixo global para as rotas
  app.setGlobalPrefix('api');

  // Swagger e documentação
  const config = new DocumentBuilder()
    .setTitle('Notas API')
    .setDescription('API para gerenciamento de notas')
    .setVersion('1.0')
    .addTag('notas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciando o servidor
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor rodando em http://localhost:${port}`);

}
bootstrap();

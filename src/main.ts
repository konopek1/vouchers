import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import corsSettings from './corsSettings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors(corsSettings);
  // object validation
  app.useGlobalPipes(new ValidationPipe({transform: true}));

  // cookie parsing as object
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
  .setTitle('Voucher')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app,swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}

bootstrap();

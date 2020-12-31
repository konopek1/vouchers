import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  // object validation
  app.useGlobalPipes(new ValidationPipe());

  // cookie parsing as object
  app.use(cookieParser);
  
  await app.listen(process.env.PORT);
}
bootstrap();

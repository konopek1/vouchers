import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlgorandModule } from './algorand/algorand.module';
import { DatabaseModule } from './database/database.module';
const Joi = require('@hapi/joi');


const validationSchema = Joi.object({
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  PORT: Joi.number(),
  ALGORAND_TOKEN: Joi.string().required(),
  ALGORAND_URL: Joi.string().required(),
  ALGORAND_PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().required()
});

@Module({
  imports: [AlgorandModule, ConfigModule.forRoot({validationSchema}), DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

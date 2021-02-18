import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlgorandModule } from './algorand/algorand.module';
import { AsaModule } from './asa/asa.module';
import { DatabaseModule } from './database/database.module';
import { PaymentModule } from './payment/payment.module';
import { ParticipationModule } from './participation/participation.module';
import WalletModule from './wallet/wallet.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
  JWT_EXPIRATION_TIME: Joi.string().required(),
  CLAWBACK_ESCROW_TEAL: Joi.string().required(),
  POI_TEAL: Joi.string().required(),
  POI_CLEAR_TEAL: Joi.string().required(),
  USER_APP_URL: Joi.string().required(),
  ADMIN_APP_URL: Joi.string().required()
});

@Module({
  imports: [AlgorandModule, ConfigModule.forRoot({ validationSchema }), DatabaseModule, AsaModule, PaymentModule, WalletModule, ParticipationModule,
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'apps/admin_app'),
        serveRoot: '/admin'
      },
      {
        rootPath: join(__dirname, '..', 'apps/user_app'),
      },
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AlgorandModule } from './algorand/algorand.module';

@Module({
  imports: [AlgorandModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

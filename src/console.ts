import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import * as repl from 'repl';
import createWalletFromMnemonic from './consoleScripts/createWalletFromMnemonic';

class InteractiveNestJS {
  async run() {
    // create the application context
    const targetModule = require(`${__dirname}/app.module`);
    const applicationContext = await NestFactory.createApplicationContext(
      // tslint:disable-next-line: no-string-literal
      targetModule['AppModule'],
    );
    const awaitOutside = require('await-outside');
    // start node repl
    const server = repl.start({
      useColors: true,
      prompt: '> ',
      ignoreUndefined: true,
    });
    server.context.app = applicationContext;
    
    // ---- ADD CUSTOM SCRIPTS ----
    server.context.createWalletFromMnemonic = createWalletFromMnemonic;
    
    awaitOutside.addAwaitOutsideToReplServer(server);
  }
}

const session = new InteractiveNestJS();
session.run();
import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('')
export default class AppController {
  
  @Get('status')
  @HttpCode(200)
  public getStatus() {
    
    return 'ok';
  }
}

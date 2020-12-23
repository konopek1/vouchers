import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('')
export default class AppController {
  @Get('status')
  @HttpCode(200)
  getStatus() {
    return 'ok';
  }
}

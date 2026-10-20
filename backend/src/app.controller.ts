import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller("")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('danny')
  getDanny(): string {
    return this.appService.getDanny();
  }
  @Get('health')
  getHealth(): object {
    return {
      'statusCode' : 200,
      'message' : 'Ok'
    }
  }
}

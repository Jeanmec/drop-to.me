import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { extractIp } from './utils/ip.utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ip')
  getClientIp(@Req() req: Request): { ip: string } {
    const ip = extractIp(req);
    return { ip };
  }
}

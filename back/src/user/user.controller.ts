import { Controller, Req, Body, Get } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/ip')
  getClientIp(@Req() req: Request): { ip: string } {
    const ip = this.userService.getIp(req);
    return { ip };
  }
}

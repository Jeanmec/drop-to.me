import { Injectable } from '@nestjs/common';
import { getClientIp } from 'request-ip';
import { Request } from 'express';

@Injectable()
export class UserService {
  getIp(req: Request): string {
    const ip = getClientIp(req);

    if (!ip) {
      throw new Error('Could not determine client IP address');
    }

    return ip;
  }
}

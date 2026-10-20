import { randomUUID } from 'node:crypto';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class SecurityAuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('SecurityMiddleware');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    // Attach request ID and security headers
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // Normalize phone numbers in auth payloads (strips spaces/dashes)
    if (req.body && typeof req.body === 'object' && 'phoneNumber' in req.body) {
      const rawPhone = (req.body as Record<string, unknown>).phoneNumber;
      if (typeof rawPhone === 'string') {
        (req.body as Record<string, unknown>).phoneNumber = rawPhone
          .trim()
          .replace(/[\s-]/g, '');
      }
    }

    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const { method, originalUrl, ip } = req;
      const { statusCode } = res;
      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} ${statusCode} - ${durationMs}ms (${ip ?? 'unknown-ip'})`,
      );
    });

    next();
  }
}

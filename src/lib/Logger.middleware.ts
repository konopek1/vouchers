import { Request, Response, NextFunction } from "express";
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { performance } from 'perf_hooks';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const startRequestTime = performance.now();

    response.on("finish", () => {
      const { statusCode } = response;

      // excluded paths
      if(originalUrl.startsWith('/user/balance')) return;

      const requestTime = (performance.now() - startRequestTime).toFixed(2);

      this.logger.log(
        `${method} ${statusCode} ${originalUrl} ${ip} - ${requestTime} ms`,
      );
    });

    next();
  }
}
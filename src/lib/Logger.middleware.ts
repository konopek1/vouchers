import { Request, Response, NextFunction } from "express";
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;


    response.on("finish", () => {
      const { statusCode } = response;

      // excluded paths
      if(originalUrl.startsWith('/payment/balance')) return;

      this.logger.log(
        `${method} ${statusCode} ${originalUrl} ${ip}`,
      );
    });

    next();
  }
}
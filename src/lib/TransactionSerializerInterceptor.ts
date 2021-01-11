import { func } from '@hapi/joi';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { encodeUnsignedTransaction } from 'algosdk';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransactionSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map(value => serializeTransaction(value)));
  }
}


function isTransaction(value: unknown) {
  return (
    !!value['get_obj_for_encoding']
    &&
    typeof value['get_obj_for_encoding'] === 'function'
    &&
    value['name'] === 'Transaction'
  );
}

function serializeTransaction(value: any) {
  if (isTransaction(value)) {
    return {
      _serialize: 'Transaction',
      value: encodeUnsignedTransaction(value)
    };
  }
  return value;
}

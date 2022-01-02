import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { encodeUnsignedTransaction, Transaction } from 'algosdk';
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

export function encodeTx(value: Transaction): Array<number> {
  return Array.from(encodeUnsignedTransaction(value));
}

function isTransaction(value: unknown) {
  return (
    !!value
    &&
    !!value['get_obj_for_encoding']
    &&
    typeof value['get_obj_for_encoding'] === 'function'
    &&
    value['name'] === 'Transaction'
  );
}

function isArrayOfTransactions(value: any[]) {
    if(Array.isArray(value)) {
      return value.every(isTransaction);
    }
    return false;
}

function serializeTransaction(value: any) {
  if (isTransaction(value)) {
    return {
      _serialize: 'Transaction',
      txn: encodeTx(value)
    };
  } 
  else if(isArrayOfTransactions(value)) {
    return {
      _serialize: 'Transactions',
      txn: value.map(encodeTx)
    }
  }
  return value;
}

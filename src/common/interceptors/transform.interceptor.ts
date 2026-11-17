import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response already contains data & meta (e.g. paginated results)
        if (res && typeof res === 'object' && 'data' in res && 'total' in res) {
          const { data, ...meta } = res;
          return {
            success: true,
            message: 'Request successful',
            data,
            meta,
          };
        }

        // Standard response
        return {
          success: true,
          message: 'Request successful',
          data: res,
          meta: null,
        };
      }),
    );
  }
}

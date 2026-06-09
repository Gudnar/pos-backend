import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class EmpresaContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    if (req.user && !req.user.clienteId) {
      const empresaId = req.headers['x-empresa-id'];
      if (empresaId) {
        req.user.clienteId = String(empresaId);
      }
    }
    return next.handle();
  }
}

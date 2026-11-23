import { Response } from 'express';
import { LogoEmpresaService } from '../service/logo-empresa.service';
export declare class LogoEmpresaController {
    private readonly svc;
    constructor(svc: LogoEmpresaService);
    ver(clienteId: string, archivo: string, res: Response): Promise<void>;
}

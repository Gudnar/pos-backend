import { ClienteService } from '../service/cliente.service';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
import { MiCuentaService } from '../../mi-cuenta/service/mi-cuenta.service';
export declare class ClienteController {
    private readonly clienteService;
    private readonly miCuentaService;
    constructor(clienteService: ClienteService, miCuentaService: MiCuentaService);
    listar(): Promise<SuccessResponseDto>;
    obtener(id: string): Promise<SuccessResponseDto>;
    crear(dto: CreateClienteDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateClienteDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
}

import { ContactosClientesService } from '../service/contactos-clientes.service';
import { CreateContactoClienteDto, UpdateContactoClienteDto } from '../dto/contacto-cliente.dto';
import { RepresentantesService } from '../../representantes/service/representantes.service';
import { CreateRepresentanteDto, UpdateRepresentanteDto, DesactivarRepresentanteDto } from '../../representantes/dto/representante.dto';
export declare class ContactosClientesController {
    private readonly svc;
    private readonly repSvc;
    constructor(svc: ContactosClientesService, repSvc: RepresentantesService);
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/contacto-cliente.entity").ContactoCliente;
    }>;
    crear(req: any, dto: CreateContactoClienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/contacto-cliente.entity").ContactoCliente;
    }>;
    actualizar(req: any, id: string, dto: UpdateContactoClienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/contacto-cliente.entity").ContactoCliente;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarReps(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante[];
    }>;
    crearRep(req: any, id: string, dto: CreateRepresentanteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante;
    }>;
    actualizarRep(req: any, repId: string, dto: UpdateRepresentanteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante;
    }>;
    desactivarRep(req: any, repId: string, dto: DesactivarRepresentanteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante;
    }>;
    eliminarRep(req: any, repId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}

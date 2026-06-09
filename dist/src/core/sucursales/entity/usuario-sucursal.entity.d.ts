import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class UsuarioSucursal extends AuditoriaEntity {
    id: string;
    clienteId: string;
    usuarioId: string;
    sucursalId: string;
    constructor(data?: Partial<UsuarioSucursal>);
}

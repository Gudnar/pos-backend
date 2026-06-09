export declare const TipoLog: {
    CREACION: string;
    ESTADO: string;
    EDICION: string;
    PAGO: string;
};
export declare class CompraLog {
    id: string;
    clienteId: string;
    compraId: string;
    tipo: string;
    estadoAnterior?: string;
    estadoNuevo?: string;
    descripcion: string;
    usuarioId?: string;
    createdAt: Date;
}

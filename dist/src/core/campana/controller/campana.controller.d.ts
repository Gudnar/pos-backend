import { CampanaService } from '../service/campana.service';
import { CreateCampanaDto, UpdateCampanaDto } from '../dto/campana.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class CampanaController {
    private readonly svc;
    constructor(svc: CampanaService);
    listar(req: any): Promise<SuccessResponseDto>;
    crear(req: any, dto: CreateCampanaDto): Promise<SuccessResponseDto>;
    actualizar(req: any, id: string, dto: UpdateCampanaDto): Promise<SuccessResponseDto>;
    eliminar(req: any, id: string): Promise<SuccessResponseDto>;
}

import { Controller, Get, Param, Res } from '@nestjs/common'
import { Response } from 'express'
import { LogoEmpresaService } from '../service/logo-empresa.service'

/**
 * Logo público de la empresa. Sin autenticación porque lo cargan <img> y las ventanas de impresión,
 * que no envían el token. El nombre del archivo cambia en cada subida, así que se cachea largo.
 */
@Controller('empresa-logo')
export class LogoEmpresaController {
  constructor(private readonly svc: LogoEmpresaService) {}

  @Get(':clienteId/:archivo')
  async ver(@Param('clienteId') clienteId: string, @Param('archivo') archivo: string, @Res() res: Response) {
    const { ruta, mime } = await this.svc.rutaPublica(clienteId, archivo)
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.sendFile(ruta)
  }
}

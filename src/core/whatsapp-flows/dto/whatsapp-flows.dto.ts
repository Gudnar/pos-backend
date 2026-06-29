// Payload cifrado que Meta envía al endpoint POST /whatsapp/flow
export interface WaFlowEncryptedRequest {
  encrypted_aes_key:   string  // AES key cifrada con RSA-OAEP (Base64)
  encrypted_flow_data: string  // datos del Flow cifrados con AES-128-GCM (Base64)
  initial_vector:      string  // IV para AES-GCM (Base64)
}

// Payload desencriptado — acción que envía Meta
export interface WaFlowActionPayload {
  version:          string
  action:           'INIT' | 'data_exchange' | 'BACK' | 'ping'
  screen?:          string
  data?:            Record<string, any>
  flow_token?:      string
  phone_number_id?: string
}

// Respuesta antes de cifrar — navegar a pantalla o cerrar
export interface WaFlowScreenResponse {
  screen: string
  data:   Record<string, any>
}

export interface WaFlowCloseResponse {
  close_flow: true
}

export interface WaFlowPingResponse {
  data: { status: string }
}

export type WaFlowResponsePayload = WaFlowScreenResponse | WaFlowCloseResponse | WaFlowPingResponse

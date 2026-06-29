export interface WaFlowEncryptedRequest {
    encrypted_aes_key: string;
    encrypted_flow_data: string;
    initial_vector: string;
}
export interface WaFlowActionPayload {
    version: string;
    action: 'INIT' | 'data_exchange' | 'BACK' | 'ping';
    screen?: string;
    data?: Record<string, any>;
    flow_token?: string;
    phone_number_id?: string;
}
export interface WaFlowScreenResponse {
    screen: string;
    data: Record<string, any>;
}
export interface WaFlowCloseResponse {
    close_flow: true;
}
export interface WaFlowPingResponse {
    data: {
        status: string;
    };
}
export type WaFlowResponsePayload = WaFlowScreenResponse | WaFlowCloseResponse | WaFlowPingResponse;

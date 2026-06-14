import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import {
  VivaSession,
  VivaStartPayload,
  VivaStartResponse,
  VivaAnswerPayload,
  VivaAnswerResponse,
  VivaCompleteResponse,
  PaginatedResponse,
} from '../types';

class VivaService {
  async startVivaSession(payload: VivaStartPayload): Promise<VivaStartResponse> {
    const response = await apiClient.post<VivaStartResponse>(
      API_CONFIG.ENDPOINTS.VIVA_START,
      payload
    );
    return response;
  }

  async submitAnswer(vivaId: string, payload: VivaAnswerPayload): Promise<VivaAnswerResponse> {
    const response = await apiClient.post<VivaAnswerResponse>(
      API_CONFIG.ENDPOINTS.VIVA_ANSWER.replace(':id', vivaId),
      payload
    );
    return response;
  }

  async completeViva(vivaId: string): Promise<VivaCompleteResponse> {
    const response = await apiClient.patch<VivaCompleteResponse>(
      API_CONFIG.ENDPOINTS.VIVA_COMPLETE.replace(':id', vivaId)
    );
    return response;
  }

  async getVivaById(vivaId: string): Promise<VivaSession> {
    const response = await apiClient.get<VivaSession>(
      API_CONFIG.ENDPOINTS.VIVA_GET.replace(':id', vivaId)
    );
    return response;
  }

  async getUserVivas(
    page: number = 1,
    limit: number = 10,
    status?: VivaSession['status']
  ): Promise<PaginatedResponse<VivaSession>> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;

    const response = await apiClient.get<PaginatedResponse<VivaSession>>(
      API_CONFIG.ENDPOINTS.VIVA_LIST,
      params
    );
    return response;
  }
}

export const vivaService = new VivaService();
export default vivaService;

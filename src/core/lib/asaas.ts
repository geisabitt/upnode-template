/**
 * 🔐 Asaas Integration Library
 * Handles all Asaas API calls with explicit environment control (sandbox vs production)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface AsaasConfig {
  apiKey: string;
  baseUrl: string;
  isSandbox: boolean;
}

/**
 * Get the Asaas API key from environment variables
 */
export function getAsaasApiKey(): string {
  const key =
    process.env.ASAAS_API_KEY
  if (!key) {
    throw new Error('ASAAS_API_KEY não configurada');
  }

  return key;
}

/**
 * Detect environment via ENV (NÃO pela chave)
 */
export function isSandboxEnvironment(): boolean {
  const env = process.env.ASAAS_ENV?.trim();

  if (!env) {
    throw new Error(
      'ASAAS_ENV não configurado. Use "sandbox" ou "production"'
    );
  }

  if (!['sandbox', 'production'].includes(env)) throw new Error('ASAAS_ENV inválido');
  return env === 'sandbox';
}

/**
 * Get base URL based on environment
 */
export function getAsaasBaseUrl(): string {
  const isSandbox = isSandboxEnvironment();

  return isSandbox
    ? 'https://api-sandbox.asaas.com/v3'
    : 'https://api.asaas.com/v3';
}

/**
 * Build config object
 */
export function getAsaasConfig(): AsaasConfig {
  const apiKey = getAsaasApiKey();
  const isSandbox = isSandboxEnvironment();
  const baseUrl = getAsaasBaseUrl();

  return {
    apiKey,
    baseUrl,
    isSandbox,
  };
}

/**
 * Mask API key for safe logging
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '****';
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

/**
 * Main fetch wrapper for Asaas API
 */
export async function asaasFetch<T = unknown>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: Record<string, unknown>
): Promise<T> {
  const config = getAsaasConfig();
  const url = `${config.baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    access_token: config.apiKey,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    signal: AbortSignal.timeout(65_000),
    cache: 'no-store',
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    const text = await response.text();

    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error('Resposta inválida do Asaas');
    }

    if (!response.ok) {

      throw new Error(`Erro no Asaas (${response.status})`);
    }

    return data as T;
  } catch (error) {
    throw error;
  }
}

export interface CreateAsaasAccountData {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface AsaasAccountResponse {
  id: string;
  walletId?: string;
}

export async function createAsaasAccount(
  account: CreateAsaasAccountData
): Promise<AsaasAccountResponse> {
  const response = await asaasFetch<AsaasAccountResponse>('/accounts', 'POST', {
    name: account.name,
    email: account.email,
    cpfCnpj: account.cpfCnpj || undefined,
    phone: account.phone || undefined,
  });

  return {
    id: response.id,
    walletId: response.walletId,
  };
}

/**
 * =========================
 * TYPES (opcional)
 * =========================
 */

export interface AsaasCustomer {
  document?: string;
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  createdAt: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
  value: number;
  status: string;
  dueDate: string;
  externalReference?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}
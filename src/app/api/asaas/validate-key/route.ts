import { withModuleApi } from '@/core/lib/module-server'
import { withAdmin } from '@/core/lib/admin-access'
/**
 * Validates Asaas API key by making a simple test request
 * GET /api/asaas/validate-key
 */

import { NextResponse } from 'next/server';
import { asaasFetch, getAsaasConfig } from '@/core/lib/asaas';

export const runtime = 'nodejs';

async function GET(request: Request) {
  void request
  try {
    const config = getAsaasConfig();
    const env = config.isSandbox ? 'SANDBOX' : 'PRODUCTION';
    
    console.log(`[Asaas Validate] Testing API key on ${env} environment`);
    
    // Make a simple GET request to validate the key
    await asaasFetch('/customers?limit=1');
    
    return NextResponse.json({
      valid: true,
      environment: config.isSandbox ? 'sandbox' : 'production',
      message: `API key válida para ${env}`,
    });
  } catch {
    
    return NextResponse.json(
      {
        valid: false,
        error: 'Não foi possível validar a integração Asaas.',
      },
      { status: 400 }
    );
  }
}

const securedGET = withAdmin(GET)


const moduleGET = withModuleApi('/api/asaas/validate-key', securedGET)
export { moduleGET as GET }

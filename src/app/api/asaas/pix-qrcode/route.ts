/**
 * Get Pix QR Code for a payment
 * GET /api/asaas/pix-qrcode?paymentId={paymentId}
 * 
 * Returns:
 * {
 *   success: boolean
 *   encodedImage: string (base64 image data)
 *   payload: string (Pix copy-paste)
 *   expirationDate: string (ISO date)
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { asaasFetch, AsaasPixQrCode } from '@/core/lib/asaas';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId é obrigatório' },
        { status: 400 }
      );
    }
    
    console.log('[Asaas Pix QRCode] Fetching QR Code for payment:', paymentId);
    
    // Fetch QR Code from Asaas
    const qrCode = await asaasFetch<AsaasPixQrCode>(
      `/payments/${paymentId}/pixQrCode`,
      'GET'
    );
    
    console.log('[Asaas Pix QRCode] Success');
    
    return NextResponse.json({
      success: true,
      encodedImage: qrCode.encodedImage,
      payload: qrCode.payload,
      expirationDate: qrCode.expirationDate,
    });
  } catch (error: any) {
    console.error('[Asaas Pix QRCode Error]:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Erro ao obter QR Code Pix',
      },
      { status: 400 }
    );
  }
}

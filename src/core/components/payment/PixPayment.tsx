/**
 * PixPayment Component
 * Displays Pix QR Code for payment
 */

'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PixPaymentProps {
  paymentId: string;
  total: number;
}

export default function PixPayment({ paymentId, total }: PixPaymentProps) {
  const [qrCode, setQrCode] = useState<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/asaas/pix-qrcode?paymentId=${paymentId}`);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erro ao gerar QR Code Pix');
        }

        const data = await res.json();
        setQrCode(data);
        setError(null);
      } catch (err: any) {
        console.error('[Pix QRCode Error]:', err);
        setError(err.message || 'Erro ao gerar QR Code');
        toast.error('Erro ao gerar QR Code Pix');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQrCode();
  }, [paymentId]);

  const handleCopyPayload = async () => {
    if (!qrCode?.payload) return;

    try {
      await navigator.clipboard.writeText(qrCode.payload);
      setCopied(true);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-[var(--color-text-secondary)]">Gerando QR Code...</p>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-error)] text-center">
        <p className="text-[var(--color-error)]">{error || 'Erro ao gerar QR Code'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm hover:opacity-90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-border)]">
          <img
            src={`data:image/png;base64,${qrCode.encodedImage}`}
            alt="QR Code Pix"
            className="w-56 h-56"
          />
        </div>
      </div>

      {/* Informações */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Total a pagar:</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              R$ {total.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Chave Pix */}
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Chave Pix (Copia e Cola):
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrCode.payload}
              readOnly
              className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm text-[var(--color-text-secondary)] font-mono break-all"
            />
            <button
              onClick={handleCopyPayload}
              className="px-4 py-3 rounded-2xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-all flex items-center gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Instruções */}
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
            Como pagar:
          </h4>
          <ol className="text-sm text-[var(--color-text-secondary)] space-y-2 list-decimal list-inside">
            <li>Abra o app do seu banco</li>
            <li>Escolha a opção "Pagar com Pix"</li>
            <li>Escaneie o QR Code acima ou cole a chave Pix</li>
            <li>Confirme o valor e autorize a transação</li>
          </ol>
        </div>

        {/* Data de Expiração */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-secondary)]">
            ⏰ Vence em:{' '}
            {new Date(qrCode.expirationDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Aviso */}
      <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-secondary)]">
          ✓ Seu pedido será confirmado automaticamente quando o pagamento for recebido
        </p>
      </div>
    </div>
  );
}

/**
 * CreditCardForm Component
 * Form for entering credit card details
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const creditCardSchema = yup.object({
  creditCardNumber: yup
    .string()
    .required('Número do cartão é obrigatório')
    .matches(/^\d{16}$/, 'Cartão deve ter 16 dígitos'),
  creditCardHolderName: yup
    .string()
    .required('Nome do titular é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  creditCardExpirationMonth: yup
    .string()
    .required('Mês de expiração é obrigatório')
    .matches(/^(0[1-9]|1[0-2])$/, 'Mês inválido'),
  creditCardExpirationYear: yup
    .string()
    .required('Ano de expiração é obrigatório')
    .matches(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
  creditCardCvv: yup
    .string()
    .required('CVV é obrigatório')
    .matches(/^\d{3,4}$/, 'CVV deve ter 3 ou 4 dígitos'),
});

type CreditCardFormData = yup.InferType<typeof creditCardSchema>;

interface CreditCardFormProps {
  onSubmit: (data: CreditCardFormData) => Promise<void>;
  isLoading?: boolean;
  total: number;
}

export default function CreditCardForm({
  onSubmit,
  isLoading = false,
  total,
}: CreditCardFormProps) {
  const [showCvv, setShowCvv] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreditCardFormData>({
    resolver: yupResolver(creditCardSchema),
  });

  const cardNumber = watch('creditCardNumber', '');
  const formattedCardNumber =
    cardNumber
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim() || '•••• •••• •••• ••••';

  const handleFormSubmit = async (data: CreditCardFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-secondary)] mb-2">NÚMERO DO CARTÃO</p>
        <p className="text-xl font-mono font-semibold tracking-wider text-[var(--color-text-primary)]">
          {formattedCardNumber}
        </p>
      </div>

      {/* Número do Cartão */}
      <div>
        <label htmlFor="creditCardNumber" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          Número do Cartão (16 dígitos)
        </label>
        <input
          {...register('creditCardNumber')}
          id="creditCardNumber"
          placeholder="1234567890123456"
          maxLength={16}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm font-mono"
        />
        {errors.creditCardNumber && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.creditCardNumber.message}</p>
        )}
      </div>

      {/* Nome do Titular */}
      <div>
        <label htmlFor="creditCardHolderName" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          Nome do Titular
        </label>
        <input
          {...register('creditCardHolderName')}
          id="creditCardHolderName"
          placeholder="NOME COMPLETO"
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm uppercase"
        />
        {errors.creditCardHolderName && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.creditCardHolderName.message}</p>
        )}
      </div>

      {/* Validade e CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="creditCardExpirationMonth" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Mês (MM)
          </label>
          <input
            {...register('creditCardExpirationMonth')}
            id="creditCardExpirationMonth"
            placeholder="01"
            maxLength={2}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
          />
          {errors.creditCardExpirationMonth && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.creditCardExpirationMonth.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="creditCardExpirationYear" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Ano (YYYY)
          </label>
          <input
            {...register('creditCardExpirationYear')}
            id="creditCardExpirationYear"
            placeholder="2025"
            maxLength={4}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
          />
          {errors.creditCardExpirationYear && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.creditCardExpirationYear.message}</p>
          )}
        </div>
      </div>

      {/* CVV */}
      <div>
        <label htmlFor="creditCardCvv" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          CVV (Código de Segurança)
        </label>
        <div className="relative">
          <input
            {...register('creditCardCvv')}
            id="creditCardCvv"
            type={showCvv ? 'text' : 'password'}
            placeholder="123"
            maxLength={4}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => setShowCvv(!showCvv)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.creditCardCvv && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.creditCardCvv.message}</p>
        )}
      </div>

      {/* Total */}
      <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Total a pagar:</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            R$ {total.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-[var(--color-primary)] text-white font-semibold py-3 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? 'Processando...' : 'Pagar com Cartão'}
      </button>

      <p className="text-xs text-[var(--color-text-secondary)] text-center">
        ⚠️ Seus dados de cartão são processados com segurança via Asaas
      </p>
    </form>
  );
}

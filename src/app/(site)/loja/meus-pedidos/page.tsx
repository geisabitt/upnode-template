'use client'

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { OrderCard } from '@/core/components/OrderCard'
import { useBuscaPedidos } from '@/core/lib/hooks/useBuscaPedidos'

type FormInputs = {
  email: string
  cpf: string
}

// 🔒 Validação
const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email obrigatório'),
  cpf: yup.string().required('CPF obrigatório'),
})

export default function MeusPedidosPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  })

  // ✅ HOOK CORRETAMENTE USADO
  const {
    buscar,
    pedidos,
    loading,
    erro,
    semResultados,
  } = useBuscaPedidos()

  async function handleBuscarPedidos(data: FormInputs) {
    const cpfLimpo = data.cpf.replace(/\D/g, '')
    await buscar(data.email, cpfLimpo)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* 📌 Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Consultar Meus Pedidos
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Informe seu email e CPF para visualizar seus pedidos
          </p>
        </div>

        {/* 📝 Formulário */}
        <form
          onSubmit={handleSubmit(handleBuscarPedidos)}
          className="bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border)] p-6 mb-8"
        >
          <div className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[var(--color-error)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                CPF
              </label>
              <input
                {...register('cpf')}
                type="text"
                placeholder="000.000.000-00"
                className="w-full px-4 py-2 border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-[var(--color-error)]">
                  {errors.cpf.message}
                </p>
              )}
            </div>

          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:bg-[var(--color-text-tertiary)] text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⟳</span>
                Buscando...
              </span>
            ) : (
              'Buscar pedidos'
            )}
          </button>
        </form>

        {/* ⚠️ ERRO */}
        {erro && (
          <div className="mb-6 p-4 bg-red-950 border border-[var(--color-error)] rounded-lg">
            <p className="text-[var(--color-error)]">⚠️ {erro}</p>
          </div>
        )}

        {/* 🔍 SEM RESULTADO */}
        {semResultados && !loading && (
          <div className="text-center p-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg">
            <p className="text-[var(--color-text-secondary)]">
              Nenhum pedido encontrado com esses dados.
            </p>
          </div>
        )}

        {/* 📋 LISTA */}
        {pedidos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} encontrado{pedidos.length !== 1 ? 's' : ''}:
            </h2>

            {pedidos.map((pedido) => (
              <OrderCard
                key={pedido.id}
                pedido={pedido}
                onViewDetails={(id) => {
                  window.location.href = `/loja/pedido/${id}`
                }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
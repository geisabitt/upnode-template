import { requireModule } from '@/core/lib/module-server'
import { redirect } from 'next/navigation'

export default function CarrinhoRedirect() {
  requireModule('checkout')

  redirect('/loja/carrinho')
}

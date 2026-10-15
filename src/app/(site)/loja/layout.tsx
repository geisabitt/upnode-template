import { requireModule } from '@/core/lib/module-server'
import CategoriasMenu from "@/core/components/CategoriasMenu";

export default function LojaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  requireModule('store')

  return (
    <div>
      <CategoriasMenu />
      {children}
    </div>
  );
}

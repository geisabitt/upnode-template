import CategoriasMenu from "@/core/components/CategoriasMenu";

export default function LojaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <CategoriasMenu />
      {children}
    </div>
  );
}

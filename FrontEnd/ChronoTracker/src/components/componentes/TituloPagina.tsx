
interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
      {/* Lado Esquerdo: Título e Subtítulo */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-title">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Lado Direito: Botões e Ações (passados como children) */}
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}
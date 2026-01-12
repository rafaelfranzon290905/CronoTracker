import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Projeto {
  projeto_id: number;
  nome_projeto: string;
  status: boolean;
}

interface ModalProjetosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: { id: number; nome: string } | null;
}

export function ModalProjetos({ open, onOpenChange, cliente }: ModalProjetosProps) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);

  const renderStatus = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">
        Ativo
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-none">
        Inativo
      </Badge>
    );
  };

  useEffect(() => {
    if (open && cliente) {
      const fetchProjetos = async () => {
        setLoading(true);
        try {
          // Ajuste a URL conforme sua API (ex: /clientes/1/projetos ou /projetos?cliente_id=1)
          const response = await fetch(`http://localhost:3001/clientes/${cliente.id}/projetos`);
          const data = await response.json();
          setProjetos(data);
        } catch (error) {
          console.error("Erro ao buscar projetos:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProjetos();
    }
  }, [open, cliente]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Projetos de {cliente?.nome}</DialogTitle>
          <DialogDescription>Lista de projetos vinculados a este cliente.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <p className="text-center">Carregando projetos...</p>
          ) : projetos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome do Projeto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projetos.map((proj) => (
                  <TableRow key={proj.projeto_id}>
                    <TableCell>{proj.projeto_id}</TableCell>
                    <TableCell className="font-medium">{proj.nome_projeto}</TableCell>
                    <TableCell>
                       {renderStatus(proj.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">Nenhum projeto encontrado para este cliente.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
'use client'
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Clock, FileText } from "lucide-react";
// Importe seus componentes de formulário aqui (Selects de projetos, inputs de hora, etc)

export function AddTimeEntryDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modo, setModo] = useState<'form' | 'relogio'>('form');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-950 hover:bg-blue-900">
          <Plus className="mr-2" size={18} /> Lançar Horas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-8">
            Registro de Tempo
            {/* O Switch Animado que você pediu entrará aqui */}
            <div className="flex bg-muted p-1 rounded-full scale-90">
               <Button 
                size="sm" variant={modo === 'form' ? 'default' : 'ghost'} 
                onClick={() => setModo('form')} className="rounded-full"
               >
                 <FileText size={16} className="mr-2"/> Formulário
               </Button>
               <Button 
                size="sm" variant={modo === 'relogio' ? 'default' : 'ghost'} 
                onClick={() => setModo('relogio')} className="rounded-full"
               >
                 <Clock size={16} className="mr-2"/> Relógio
               </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {modo === 'form' ? (
          <div className="space-y-4 py-4">
            {/* Aqui você constrói o formulário com:
                1. Select Projeto (Filtrado)
                2. Select Atividade (Dependente do projeto)
                3. Input Data, Hora Início, Hora Fim
                4. Textarea Descrição
            */}
            <p className="text-center text-muted-foreground italic">Formulário de lançamento aqui...</p>
            <Button className="w-full" onClick={() => setIsOpen(false)}>Salvar Lançamento</Button>
          </div>
        ) : (
          <div className="py-10 text-center">
            <h2 className="text-4xl font-bold mb-4">00:00:00</h2>
            <Button variant="outline" size="lg" className="rounded-full w-20 h-20 border-2">Play</Button>
            <p className="mt-4 text-sm text-muted-foreground">O modo relógio será implementado em breve.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
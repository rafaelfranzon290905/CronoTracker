import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/apiConfig";

interface EditTimeEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: any;
  onSave: (id: number, data: any) => Promise<void>;
}

export function EditTimeEntryModal({ open, onOpenChange, entry, onSave }: EditTimeEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    projeto_id: "",
    atividade_id: "",
    data_lancamento: "",
    hora_inicio: "",
    hora_fim: "",
    descricao: "",
    motivo_edicao: ""
  });

  useEffect(() => {
    if (open) {
      const fetchListas = async () => {
        try {
          const [resProjetos, resAtividades] = await Promise.all([
            fetch(`${API_BASE_URL}/projetos`),
            fetch(`${API_BASE_URL}/atividades`)
          ]);
          
          if(resProjetos.ok) setProjetos(await resProjetos.json());
          if(resAtividades.ok) setAtividades(await resAtividades.json());
        } catch (error) {
          console.error("Erro ao carregar listas", error);
        }
      };
      fetchListas();
    }
  }, [open]);

  useEffect(() => {
    if (entry && open) {
      const dataFormatada = new Date(entry.data_lancamento).toISOString().split('T')[0];
      
      const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
      };

      setFormData({
        projeto_id: entry.projeto_id?.toString() || "",
        atividade_id: entry.atividade_id?.toString() || "",
        data_lancamento: dataFormatada,
        hora_inicio: formatTime(entry.hora_inicio),
        hora_fim: formatTime(entry.hora_fim),
        descricao: entry.descricao || "",
        motivo_edicao: ""
      });
    }
  }, [entry, open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (formData.motivo_edicao.length < 5) {
      return toast.warning("A justificativa é obrigatória.");
    }

    setLoading(true);
    try {
      // Encontra o cliente_id baseado no projeto selecionado (para manter consistência)
      const projetoSelecionado = projetos.find(p => p.projeto_id.toString() === formData.projeto_id);
      const clienteId = projetoSelecionado ? projetoSelecionado.cliente_id : entry.cliente_id;

      const payload = {
        ...formData,
        cliente_id: clienteId
      };

      await onSave(entry.lancamento_id, payload);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lançamento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Projeto */}
            <div className="space-y-2">
              <Label>Projeto</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.projeto_id}
                onChange={(e) => handleChange("projeto_id", e.target.value)}
              >
                <option value="">Selecione...</option>
                {projetos.map((p) => (
                  <option key={p.projeto_id} value={p.projeto_id}>
                    {p.nome_projeto}
                  </option>
                ))}
              </select>
            </div>

            {/* Atividade */}
            <div className="space-y-2">
  <Label>Atividade</Label>
  <select 
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    value={formData.atividade_id}
    onChange={(e) => handleChange("atividade_id", e.target.value)}
  >
    <option value="">Selecione...</option>
    {Array.isArray(atividades) && atividades
      .filter(a => {
        if (!formData.projeto_id) return true;
        return String(a.projeto_id) === String(formData.projeto_id);
      })
      .map((a) => (
      <option key={a.atividade_id} value={a.atividade_id}>
        {a.nome_atividade}
      </option>
    ))}
  </select>
</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Data */}
            <div className="space-y-2">
              <Label>Data</Label>
              <Input 
                type="date" 
                value={formData.data_lancamento} 
                onChange={(e) => handleChange("data_lancamento", e.target.value)}
              />
            </div>

            {/* Hora Início */}
            <div className="space-y-2">
              <Label>Início</Label>
              <Input 
                type="time" 
                value={formData.hora_inicio} 
                onChange={(e) => handleChange("hora_inicio", e.target.value)}
              />
            </div>

            {/* Hora Fim */}
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input 
                type="time" 
                value={formData.hora_fim} 
                onChange={(e) => handleChange("hora_fim", e.target.value)}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição da Atividade</Label>
            <Textarea 
              rows={3}
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
            />
          </div>

          {/* Justificativa da Edição (Obrigatória) */}
          <div className="space-y-2 bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <Label className="text-yellow-800">Justificativa da Alteração (Obrigatório)</Label>
            <Textarea 
              className="bg-white"
              placeholder="Explique por que está alterando este registro..."
              value={formData.motivo_edicao}
              onChange={(e) => handleChange("motivo_edicao", e.target.value)}
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
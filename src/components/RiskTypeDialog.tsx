import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { RiskType } from "@/types/risk";
import { saveRiskType } from "@/lib/riskStorage";
import { RiskTestPanel } from "./RiskTestPanel";

interface RiskTypeDialogProps {
  open: boolean;
  onClose: () => void;
  editingRisk?: RiskType;
}

export const RiskTypeDialog = ({ open, onClose, editingRisk }: RiskTypeDialogProps) => {
  const [title, setTitle] = useState("");
  const [contextPrompt, setContextPrompt] = useState("");
  const [outputPrompt, setOutputPrompt] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("config");
  const { toast } = useToast();

  useEffect(() => {
    if (editingRisk) {
      setTitle(editingRisk.title);
      setContextPrompt(editingRisk.contextPrompt);
      setOutputPrompt(editingRisk.outputPrompt);
      setEnabled(editingRisk.enabled);
    } else {
      setTitle("");
      setContextPrompt("");
      setOutputPrompt("");
      setEnabled(true);
    }
    setActiveTab("config");
  }, [editingRisk, open]);

  const handleSave = () => {
    if (!title.trim() || !contextPrompt.trim() || !outputPrompt.trim()) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi prima di salvare",
        variant: "destructive",
      });
      return;
    }

    const risk: RiskType = {
      id: editingRisk?.id || crypto.randomUUID(),
      title: title.trim(),
      contextPrompt: contextPrompt.trim(),
      outputPrompt: outputPrompt.trim(),
      enabled,
      createdAt: editingRisk?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRiskType(risk);
    window.dispatchEvent(new Event('riskTypesUpdated'));
    
    toast({
      title: editingRisk ? "Rischio aggiornato" : "Rischio creato",
      description: `Il rischio "${risk.title}" è stato salvato con successo`,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRisk ? "Modifica Rischio" : "Nuovo Rischio"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configurazione</TabsTrigger>
            <TabsTrigger value="test">Test Live</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo Rischio *</Label>
              <Input
                id="title"
                placeholder="es. Rischio Rumore, Rischio Biologico, ecc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contextPrompt">Prompt di Contesto *</Label>
              <Textarea
                id="contextPrompt"
                placeholder="Spiega all'AI cosa deve cercare nel documento. Es: 'Analizza questo documento di valutazione del rischio rumore e identifica...'"
                value={contextPrompt}
                onChange={(e) => setContextPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Descrivi il contesto e cosa l'AI deve analizzare nel documento allegato
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputPrompt">Prompt di Output Atteso *</Label>
              <Textarea
                id="outputPrompt"
                placeholder="Specifica i dati tabellati da estrarre. Es: 'Restituisci una tabella JSON con i seguenti campi: area, livello_rumore, tempo_esposizione, azioni_correttive'"
                value={outputPrompt}
                onChange={(e) => setOutputPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Definisci la struttura dei dati da estrarre (formato tabellare/JSON)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="enabled" className="cursor-pointer">
                Abilita questo rischio
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button onClick={handleSave}>
                {editingRisk ? "Aggiorna" : "Crea"} Rischio
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="test" className="mt-6">
            <RiskTestPanel
              contextPrompt={contextPrompt}
              outputPrompt={outputPrompt}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

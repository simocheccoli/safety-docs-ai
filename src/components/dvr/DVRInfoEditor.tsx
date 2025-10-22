import { useState } from "react";
import { DVR, DVRStatus } from "@/types/dvr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { dvrApi } from "@/lib/dvrApi";
import { z } from "zod";

interface DVRInfoEditorProps {
  dvr: DVR;
  onUpdate: () => void;
}

const dvrSchema = z.object({
  nome: z.string().trim().min(1, "Il nome è obbligatorio").max(200, "Il nome non può superare i 200 caratteri"),
  descrizione: z.string().max(1000, "La descrizione non può superare i 1000 caratteri").optional(),
  stato: z.enum(['BOZZA', 'IN_REVISIONE', 'IN_APPROVAZIONE', 'APPROVATO', 'FINALIZZATO', 'ARCHIVIATO'])
});

const statusLabels: Record<DVRStatus, string> = {
  'BOZZA': 'Bozza',
  'IN_REVISIONE': 'In Revisione',
  'IN_APPROVAZIONE': 'In Approvazione',
  'APPROVATO': 'Approvato',
  'FINALIZZATO': 'Finalizzato',
  'ARCHIVIATO': 'Archiviato'
};

const statusColors: Record<DVRStatus, string> = {
  'BOZZA': 'bg-gray-500',
  'IN_REVISIONE': 'bg-blue-500',
  'IN_APPROVAZIONE': 'bg-yellow-500',
  'APPROVATO': 'bg-green-500',
  'FINALIZZATO': 'bg-emerald-600',
  'ARCHIVIATO': 'bg-slate-400'
};

export function DVRInfoEditor({ dvr, onUpdate }: DVRInfoEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState(dvr.nome);
  const [descrizione, setDescrizione] = useState(dvr.descrizione || "");
  const [stato, setStato] = useState<DVRStatus>(dvr.stato);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Validazione con Zod
      const validated = dvrSchema.parse({
        nome,
        descrizione: descrizione || undefined,
        stato
      });

      await dvrApi.updateDVR(dvr.id, {
        nome: validated.nome,
        descrizione: validated.descrizione,
        stato: validated.stato,
        updated_by: 'current_user'
      });

      toast({
        title: "DVR Aggiornato",
        description: "Le informazioni sono state salvate con successo",
      });

      setIsOpen(false);
      onUpdate();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Modifica Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifica Informazioni DVR</DialogTitle>
          <DialogDescription>
            Aggiorna nome, descrizione e stato del documento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome DVR *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Inserisci il nome del DVR"
              className={errors.nome ? 'border-red-500' : ''}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Textarea
              id="descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder="Inserisci una descrizione del DVR (opzionale)"
              rows={4}
              className={errors.descrizione ? 'border-red-500' : ''}
            />
            {errors.descrizione && (
              <p className="text-sm text-red-500">{errors.descrizione}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {descrizione.length}/1000 caratteri
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stato">Stato *</Label>
            <Select value={stato} onValueChange={(value) => setStato(value as DVRStatus)}>
              <SelectTrigger id="stato" className={errors.stato ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[value as DVRStatus]}`} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stato && (
              <p className="text-sm text-red-500">{errors.stato}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { statusLabels, statusColors };
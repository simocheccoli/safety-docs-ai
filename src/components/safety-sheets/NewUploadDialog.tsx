import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createUpload } from "@/lib/elaborationApi";
import { companyApi } from "@/lib/companyApi";
import { Company } from "@/types/company";

interface NewUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elaborationId: number;
  companyId: number | null;
  onSuccess: () => void;
}

export function NewUploadDialog({ open, onOpenChange, elaborationId, companyId, onSuccess }: NewUploadDialogProps) {
  const [mansione, setMansione] = useState("");
  const [reparto, setReparto] = useState("");
  const [ruolo, setRuolo] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && companyId) {
      loadCompany();
    }
  }, [open, companyId]);

  const loadCompany = async () => {
    if (!companyId) return;
    try {
      const data = await companyApi.getById(companyId);
      setCompany(data);
    } catch (error) {
      console.error("Error loading company:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      );
      
      if (newFiles.length !== e.target.files.length) {
        toast({
          title: "Attenzione",
          description: "Solo file PDF sono accettati",
          variant: "destructive",
        });
      }
      
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!mansione.trim()) {
      toast({
        title: "Errore",
        description: "Seleziona la mansione",
        variant: "destructive",
      });
      return;
    }

    if (!reparto.trim()) {
      toast({
        title: "Errore",
        description: "Seleziona il reparto",
        variant: "destructive",
      });
      return;
    }

    if (!ruolo.trim()) {
      toast({
        title: "Errore",
        description: "Seleziona il ruolo",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "Errore",
        description: "Carica almeno un file PDF",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await createUpload(elaborationId, mansione.trim(), reparto.trim(), ruolo.trim(), files);

      toast({
        title: "Caricamento completato",
        description: `${files.length} file caricati con successo`,
      });

      resetForm();
      onSuccess();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile completare il caricamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMansione("");
    setReparto("");
    setRuolo("");
    setFiles([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const mansioni = company?.mansioni || [];
  const reparti = company?.reparti || [];
  const ruoli = company?.ruoli || [];

  const hasCompanyOptions = mansioni.length > 0 || reparti.length > 0 || ruoli.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nuovo Caricamento</DialogTitle>
          <DialogDescription>
            Aggiungi un nuovo caricamento specificando mansione, reparto e ruolo
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mansione">Mansione *</Label>
              {mansioni.length > 0 ? (
                <Select value={mansione} onValueChange={setMansione}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mansioni.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="mansione"
                  placeholder="Es. Operatore CNC"
                  value={mansione}
                  onChange={(e) => setMansione(e.target.value)}
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reparto">Reparto *</Label>
              {reparti.length > 0 ? (
                <Select value={reparto} onValueChange={setReparto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reparti.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="reparto"
                  placeholder="Es. Produzione"
                  value={reparto}
                  onChange={(e) => setReparto(e.target.value)}
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ruolo">Ruolo *</Label>
              {ruoli.length > 0 ? (
                <Select value={ruolo} onValueChange={setRuolo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ruoli.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="ruolo"
                  placeholder="Es. Operaio"
                  value={ruolo}
                  onChange={(e) => setRuolo(e.target.value)}
                />
              )}
            </div>
          </div>

          {!hasCompanyOptions && companyId && (
            <p className="text-sm text-muted-foreground">
              Nessuna mansione, reparto o ruolo configurato per questa azienda. Puoi inserirli manualmente o configurarli nelle impostazioni azienda.
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="files">Allegati PDF *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="files"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('files')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Seleziona File PDF
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="grid gap-2">
              <Label>File Selezionati ({files.length})</Label>
              <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-md border p-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm bg-secondary/50 rounded px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Caricamento..." : "Carica"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

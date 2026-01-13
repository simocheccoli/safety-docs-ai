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
import { Upload, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createUpload } from "@/lib/elaborationApi";
import { companyApi } from "@/lib/companyApi";
import { Company } from "@/types/company";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
      const allFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      allFiles.forEach(file => {
        // Check file type
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          errors.push(`"${file.name}" non è un file PDF`);
          return;
        }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          errors.push(`"${file.name}" supera il limite di ${MAX_FILE_SIZE_MB}MB`);
          return;
        }
        
        validFiles.push(file);
      });
      
      if (errors.length > 0) {
        toast({
          title: "File non validi",
          description: errors.join('. '),
          variant: "destructive",
        });
      }
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Only files are required now, mansione/reparto/ruolo are optional
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
        title: "Upload completato",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{files.length} file caricati con successo</span>
          </div>
        ),
      });

      resetForm();
      onSuccess();
    } catch (error: any) {
      // Handle different error types
      let errorMessage = "Impossibile completare il caricamento";
      
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = "Errore di rete. Verifica la connessione e riprova.";
      } else if (error?.status === 413 || error?.message?.includes('413')) {
        errorMessage = "File troppo grande. Riduci la dimensione dei file.";
      } else if (error?.status === 422 || error?.message?.includes('422')) {
        errorMessage = "Dati non validi. Verifica i campi e riprova.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Errore Upload",
        description: errorMessage,
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
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('files')?.click()}
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Seleziona File PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Solo file PDF, max {MAX_FILE_SIZE_MB}MB per file
            </p>
          </div>

          {files.length > 0 && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>File Selezionati</Label>
                <span className="text-sm font-medium text-primary">{files.length} file</span>
              </div>
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
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Alert variant="default" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Totale: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || files.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Caricamento in corso...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carica {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

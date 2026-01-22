import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompleteDeadlineData } from "@/types/deadlineValidation";
import { Deadline, NextValidationInterval, INTERVAL_LABELS } from "@/types/deadline";
import { FileText, Upload, Calendar, Info, X } from "lucide-react";
import { format, addMonths } from "date-fns";
import { it } from "date-fns/locale";

interface CompleteValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deadline: Deadline;
  onComplete: (data: CompleteDeadlineData) => Promise<void>;
}

export function CompleteValidationDialog({
  open,
  onOpenChange,
  deadline,
  onComplete,
}: CompleteValidationDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [validationDate, setValidationDate] = useState<Date>(new Date());
  const [nextValidationInterval, setNextValidationInterval] = useState<NextValidationInterval | "">("");
  const [customNextDate, setCustomNextDate] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  // Reset form quando si apre
  useEffect(() => {
    if (open) {
      setFiles([]);
      setNote("");
      setValidationDate(new Date());
      setNextValidationInterval("");
      setCustomNextDate(undefined);
    }
  }, [open]);

  // Reset custom date quando cambia intervallo
  useEffect(() => {
    if (nextValidationInterval !== 'custom') {
      setCustomNextDate(undefined);
    }
  }, [nextValidationInterval]);

  // Calcola automaticamente la prossima visita
  const calculatedNextDate = useMemo(() => {
    if (!validationDate || !nextValidationInterval) return null;
    if (nextValidationInterval === 'custom' || nextValidationInterval === 'on_request') return null;
    
    const months = parseInt(nextValidationInterval);
    if (isNaN(months)) return null;
    
    return addMonths(validationDate, months);
  }, [validationDate, nextValidationInterval]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      alert("Alcuni file non sono PDF e sono stati ignorati");
    }
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
    }
    
    // Reset input per permettere di selezionare lo stesso file più volte
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validazione: almeno uno tra file, nota, o intervallo prossima visita deve essere presente
    if (files.length === 0 && !note.trim() && !nextValidationInterval) {
      alert("Inserire almeno uno tra: PDF, nota, o intervallo prossima visita");
      return;
    }

    // Se intervallo è custom, la data personalizzata è obbligatoria
    if (nextValidationInterval === 'custom' && !customNextDate) {
      alert("Selezionare una data per la prossima visita personalizzata");
      return;
    }

    setIsSaving(true);
    try {
      const data: CompleteDeadlineData = {
        files: files.length > 0 ? files : undefined,
        note: note.trim() || undefined,
        validation_date: validationDate.toISOString().split('T')[0],
        next_validation_interval: nextValidationInterval || undefined,
        next_validation_date: (nextValidationInterval === 'custom' && customNextDate) 
          ? customNextDate.toISOString().split('T')[0] 
          : (calculatedNextDate ? calculatedNextDate.toISOString().split('T')[0] : undefined),
      };
      await onComplete(data);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Completa Valutazione: {deadline.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Informazioni visita precedente */}
          {deadline.next_validation_date && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Visita pianificata per: <strong>{format(new Date(deadline.next_validation_date), "dd MMMM yyyy", { locale: it })}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Data effettiva valutazione */}
          <div className="space-y-2">
            <Label>Data effettiva valutazione *</Label>
            <DatePicker
              date={validationDate}
              onSelect={(date) => date && setValidationDate(date)}
              placeholder="Seleziona data"
            />
          </div>

          {/* PDF upload */}
          <div className="space-y-2">
            <Label htmlFor="files">PDF Valutazione (opzionale, multipli)</Label>
            <div className="space-y-2">
              <input
                id="files"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="files"
                className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                <span>Seleziona PDF (multipli)</span>
              </label>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-7 w-7 p-0 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nota */}
          <div className="space-y-2">
            <Label htmlFor="note">Nota (opzionale)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Aggiungi una nota sulla valutazione..."
              rows={4}
            />
          </div>

          {/* Intervallo prossima valutazione */}
          <div className="space-y-2">
            <Label>Intervallo prossima valutazione (opzionale)</Label>
            <Select
              value={nextValidationInterval || "none"}
              onValueChange={(value) => setNextValidationInterval(value === "none" ? "" : value as NextValidationInterval)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona intervallo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Nessuno</span>
                </SelectItem>
                {Object.entries(INTERVAL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data personalizzata per intervallo custom */}
          {nextValidationInterval === 'custom' && (
            <div className="space-y-2">
              <Label>Data prossima valutazione (personalizzata) *</Label>
              <DatePicker
                date={customNextDate}
                onSelect={(date) => date && setCustomNextDate(date)}
                placeholder="Seleziona data personalizzata"
              />
            </div>
          )}

          {/* Preview prossima visita calcolata */}
          {calculatedNextDate && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Prossima visita calcolata: <strong>{format(calculatedNextDate, "dd MMMM yyyy", { locale: it })}</strong>
                {nextValidationInterval && ` (${INTERVAL_LABELS[nextValidationInterval]})`}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Inserire almeno uno tra: PDF (uno o più), nota, o intervallo prossima visita.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvataggio..." : "Completa Valutazione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

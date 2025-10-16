import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const NewElaborationDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

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

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per l'elaborazione",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "Errore",
        description: "Carica almeno una scheda di sicurezza",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally send the data to your API
    toast({
      title: "Elaborazione avviata",
      description: `${files.length} schede caricate con successo`,
    });

    setOpen(false);
    setName("");
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nuova Elaborazione
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nuova Elaborazione</DialogTitle>
          <DialogDescription>
            Carica le schede di sicurezza per avviare una nuova elaborazione OCR
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Elaborazione</Label>
            <Input
              id="name"
              placeholder="Es. Prodotti Chimici Q1 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="files">Schede di Sicurezza (PDF)</Label>
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
                    <span className="truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
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
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Avvia Elaborazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

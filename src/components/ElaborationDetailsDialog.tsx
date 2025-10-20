import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Pencil, Check, X, ExternalLink, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchElaborationDetails, updateElaborationTitle, getFileUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Elaboration } from "@/types/elaboration";

interface ElaborationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elaboration: Elaboration | null;
  onTitleUpdate?: () => void;
}

export function ElaborationDetailsDialog({
  open,
  onOpenChange,
  elaboration,
  onTitleUpdate,
}: ElaborationDetailsDialogProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && elaboration) {
      setEditedTitle(elaboration.title);
      setSelectedFile(null);
      loadDetails();
    }
  }, [open, elaboration]);

  const loadDetails = async () => {
    if (!elaboration) return;
    
    setLoading(true);
    try {
      const result = await fetchElaborationDetails(elaboration.id);
      setFiles(result.files);
      if (result.files.length > 0) {
        setSelectedFile(result.files[0]);
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!elaboration || !editedTitle.trim()) return;
    
    setIsSavingTitle(true);
    try {
      await updateElaborationTitle(elaboration.id, editedTitle.trim());
      toast({
        title: "Successo",
        description: "Titolo aggiornato con successo",
      });
      setIsEditingTitle(false);
      onTitleUpdate?.();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il titolo",
        variant: "destructive",
      });
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(elaboration?.title || "");
    setIsEditingTitle(false);
  };

  const handleFileClick = (filename: string) => {
    setSelectedFile(filename);
  };

  const handleDownload = (filename: string) => {
    if (!elaboration) return;
    const url = getFileUrl(elaboration.id, filename);
    window.open(url, '_blank');
  };

  if (!elaboration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1"
                  disabled={isSavingTitle}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  disabled={isSavingTitle || !editedTitle.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isSavingTitle}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <DialogTitle className="font-display text-2xl flex-1">
                  {elaboration.title}
                </DialogTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <DialogDescription>
            Schede di sicurezza caricate nell'elaborazione
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 overflow-hidden flex-1">
          <div className="w-80 space-y-2 overflow-y-auto pr-2 flex-shrink-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Caricamento...</div>
              </div>
            ) : files.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Nessun file disponibile</div>
              </div>
            ) : (
              files.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedFile === file 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-card hover:bg-accent/5'
                  }`}
                  onClick={() => handleFileClick(file)}
                >
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="flex-1 text-sm break-all">{file}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex-1 border rounded-lg overflow-hidden bg-muted/30">
            {selectedFile && elaboration ? (
              <iframe
                src={`${getFileUrl(elaboration.id, selectedFile)}#toolbar=0`}
                className="w-full h-full"
                title={selectedFile}
                style={{ minHeight: '600px' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Seleziona un file per visualizzare l'anteprima
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

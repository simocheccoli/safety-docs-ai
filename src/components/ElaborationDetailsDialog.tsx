import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Pencil, Check, X, ExternalLink } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    if (open && elaboration) {
      setEditedTitle(elaboration.title);
      loadDetails();
    }
  }, [open, elaboration]);

  const loadDetails = async () => {
    if (!elaboration) return;
    
    setLoading(true);
    try {
      const result = await fetchElaborationDetails(elaboration.id);
      setFiles(result.files);
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

  const handleFilePreview = (filename: string) => {
    if (!elaboration) return;
    const url = getFileUrl(elaboration.id, filename);
    window.open(url, '_blank');
  };

  if (!elaboration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
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
        
        <div className="space-y-2 overflow-y-auto flex-1 pr-2">
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
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors group"
              >
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="flex-1 text-sm break-all">{file}</span>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  PDF
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => handleFilePreview(file)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

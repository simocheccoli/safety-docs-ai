import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface SaveRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: string) => void;
  isSaving: boolean;
}

export function SaveRevisionDialog({ 
  open, 
  onOpenChange, 
  onSave,
  isSaving 
}: SaveRevisionDialogProps) {
  const [revisionNote, setRevisionNote] = useState("");

  const handleSave = () => {
    if (revisionNote.trim()) {
      onSave(revisionNote);
      setRevisionNote("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salva Nuova Revisione</DialogTitle>
          <DialogDescription>
            Inserisci una nota che descriva le modifiche apportate in questa revisione.
            Verrà incrementato il numero di versione.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="revision-note">
              Nota di Revisione <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="revision-note"
              placeholder="Descrivi le modifiche apportate..."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              rows={5}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              {revisionNote.length}/2000 caratteri
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={!revisionNote.trim() || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvataggio..." : "Salva Revisione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

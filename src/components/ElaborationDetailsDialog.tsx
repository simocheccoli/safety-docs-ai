import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ElaborationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elaboration: {
    title: string;
    files?: string[];
  } | null;
}

export function ElaborationDetailsDialog({
  open,
  onOpenChange,
  elaboration,
}: ElaborationDetailsDialogProps) {
  if (!elaboration) return null;

  // Mock files if not provided
  const files = elaboration.files || [
    "Scheda_Sicurezza_Acido_Cloridrico.pdf",
    "Scheda_Sicurezza_Acetone.pdf",
    "Scheda_Sicurezza_Benzene.pdf",
    "Scheda_Sicurezza_Etanolo.pdf",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {elaboration.title}
          </DialogTitle>
          <DialogDescription>
            Schede di sicurezza caricate nell'elaborazione
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <FileText className="h-5 w-5 text-primary" />
              <span className="flex-1 text-sm">{file}</span>
              <Badge variant="outline" className="text-xs">
                PDF
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

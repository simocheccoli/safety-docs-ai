import { DeadlineValidation, DeadlineValidationFile } from "@/types/deadlineValidation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, MessageSquare, Trash2, Eye, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { INTERVAL_LABELS } from "@/types/deadline";
import { useFilePreview } from "@/contexts/FilePreviewContext";

interface ValidationHistoryItemProps {
  validation: DeadlineValidation;
  onDelete?: (validationId: number) => void;
}

export function ValidationHistoryItem({ validation, onDelete }: ValidationHistoryItemProps) {
  const { openPreview } = useFilePreview();

  const handleDelete = () => {
    if (onDelete && confirm("Sei sicuro di voler eliminare questa valutazione?")) {
      onDelete(validation.id);
    }
  };

  const handlePreviewFile = (file: DeadlineValidationFile) => {
    openPreview({
      previewUrl: file.previewUrl,
      filename: file.originalName,
      size: file.size,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Data effettiva valutazione */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground">Data valutazione:</span>
              <span className="font-medium ml-2">
                {format(new Date(validation.validation_date), "dd MMMM yyyy", { locale: it })}
              </span>
            </div>
          </div>

          {/* Nota */}
          {validation.note && (
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block mb-1">Nota:</span>
                <p className="text-sm text-foreground">{validation.note}</p>
              </div>
            </div>
          )}

          {/* Prossima valutazione pianificata */}
          {validation.next_validation_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground">Prossima valutazione:</span>
                <Badge variant="outline" className="ml-2">
                  {format(new Date(validation.next_validation_date), "dd MMM yyyy", { locale: it })}
                  {validation.next_validation_interval && 
                    ` (${INTERVAL_LABELS[validation.next_validation_interval]})`
                  }
                </Badge>
              </div>
            </div>
          )}

          {/* Allegati */}
          {validation.files && validation.files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">
                  Allegati ({validation.files.length}):
                </span>
              </div>
              <div className="space-y-1 pl-6">
                {validation.files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handlePreviewFile(file)}
                    className="text-sm text-primary hover:underline flex items-center gap-1.5 group w-full text-left"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{file.originalName}</span>
                    <Eye className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

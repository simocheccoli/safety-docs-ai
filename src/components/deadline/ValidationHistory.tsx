import { DeadlineValidation } from "@/types/deadlineValidation";
import { ValidationHistoryItem } from "./ValidationHistoryItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ValidationHistoryProps {
  validations: DeadlineValidation[];
  onDelete?: (validationId: number) => void;
}

export function ValidationHistory({ validations, onDelete }: ValidationHistoryProps) {
  if (validations.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nessuna valutazione registrata per questa scadenza.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {validations.map((validation) => (
          <ValidationHistoryItem
            key={validation.id}
            validation={validation}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

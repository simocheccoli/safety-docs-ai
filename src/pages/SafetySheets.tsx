import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ElaborationCard } from "@/components/ElaborationCard";
import { NewElaborationDialog } from "@/components/NewElaborationDialog";
import { Elaboration } from "@/types/elaboration";

export default function SafetySheets() {
  const [elaborations, setElaborations] = useState<Elaboration[]>([
    {
      id: 1,
      title: "Analisi Laboratorio Q1 2024",
      status: "completed",
      begin_process: "2024-01-15T10:00:00Z",
      end_process: "2024-01-15T10:45:00Z",
      created_at: "2024-01-15T09:55:00Z",
      updated_at: "2024-01-15T10:45:00Z",
      deleted_at: null,
    },
    {
      id: 2,
      title: "Schede Chimici Reparto A",
      status: "elaborating",
      begin_process: "2024-03-10T14:20:00Z",
      end_process: null,
      created_at: "2024-03-10T14:15:00Z",
      updated_at: "2024-03-10T14:20:00Z",
      deleted_at: null,
    },
    {
      id: 3,
      title: "Verifica Sostanze Pericolose",
      status: "error",
      begin_process: "2024-02-20T09:10:00Z",
      end_process: "2024-02-20T09:25:00Z",
      created_at: "2024-02-20T09:05:00Z",
      updated_at: "2024-02-20T09:25:00Z",
      deleted_at: null,
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNewElaboration = (name: string, files: File[]) => {
    const newElaboration: Elaboration = {
      id: Math.max(...elaborations.map(e => e.id), 0) + 1,
      title: name,
      status: "elaborating",
      begin_process: new Date().toISOString(),
      end_process: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    setElaborations([newElaboration, ...elaborations]);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Schede di Sicurezza</h1>
          <p className="text-muted-foreground mt-2">
            Gestione delle elaborazioni OCR per l'analisi del rischio chimico
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuova Elaborazione
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {elaborations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Nessuna elaborazione ancora. Inizia creandone una nuova.
            </p>
          </div>
        ) : (
          elaborations.map((elaboration) => (
            <ElaborationCard key={elaboration.id} elaboration={elaboration} />
          ))
        )}
      </div>

      <NewElaborationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleNewElaboration}
      />
    </div>
  );
}

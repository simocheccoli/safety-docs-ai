import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidationHistory } from "@/components/deadline/ValidationHistory";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deadlineApi } from "@/lib/deadlineApi";
import { DeadlineValidation } from "@/types/deadlineValidation";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, History } from "lucide-react";

export default function DeadlineValidations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deadlineId = id ? parseInt(id, 10) : 0;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validationToDelete, setValidationToDelete] = useState<number | null>(null);

  const { data: validations = [], isLoading } = useQuery({
    queryKey: ['deadline-validations', deadlineId],
    queryFn: () => deadlineApi.getValidations(deadlineId),
    enabled: deadlineId > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (validationId: number) => deadlineApi.deleteValidation(deadlineId, validationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-validations', deadlineId] });
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({ title: "Validazione eliminata" });
    },
    onError: () => {
      toast({ title: "Errore nell'eliminazione", variant: "destructive" });
    }
  });

  const handleDeleteClick = (validationId: number) => {
    setValidationToDelete(validationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (validationToDelete !== null) {
      deleteMutation.mutate(validationToDelete);
      setDeleteDialogOpen(false);
      setValidationToDelete(null);
    }
  };

  if (!deadlineId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/deadlines')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Scadenze
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Scadenza non trovata</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/deadlines')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alle Scadenze
        </Button>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Storico Valutazioni</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Validazioni Effettuate</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Caricamento...</p>
          ) : (
            <ValidationHistory
              validations={validations}
              onDelete={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa valutazione? Questa azione non può essere annullata e eliminerà anche tutti gli allegati associati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setValidationToDelete(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

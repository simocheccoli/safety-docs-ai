import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { dvrApi } from "@/lib/dvrApi";
import { DVRVersion, DVRStatus } from "@/types/dvr";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { History, RotateCcw } from "lucide-react";

interface DVRVersionHistoryProps {
  dvrId: string;
  currentVersion: number;
  onVersionRestored: () => void;
}

const mapStatusLabel = (status: DVRStatus | string): string => {
  const labels: Record<string, string> = {
    BOZZA: 'Bozza',
    IN_REVISIONE: 'In Revisione',
    IN_APPROVAZIONE: 'In Approvazione',
    APPROVATO: 'Approvato',
    FINALIZZATO: 'Finalizzato',
    ARCHIVIATO: 'Archiviato',
    draft: 'Bozza',
    in_progress: 'In Elaborazione',
    review: 'In Revisione',
    approved: 'Approvato',
    archived: 'Archiviato',
  };
  return labels[status] || String(status);
};

// Helper per mappare lo stato a una variante del badge
const mapStatusVariant = (status: DVRStatus | string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    BOZZA: 'secondary',
    IN_REVISIONE: 'secondary',
    IN_APPROVAZIONE: 'secondary',
    APPROVATO: 'default',
    FINALIZZATO: 'default',
    ARCHIVIATO: 'outline',
    draft: 'secondary',
    in_progress: 'secondary',
    review: 'secondary',
    approved: 'default',
    archived: 'outline',
  };
  return variants[status] || 'outline';
};

export function DVRVersionHistory({ dvrId, currentVersion, onVersionRestored }: DVRVersionHistoryProps) {
  const [versions, setVersions] = useState<DVRVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReverting, setIsReverting] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    loadVersions();
  }, [dvrId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await dvrApi.getDVRVersions(dvrId);
      setVersions(data.sort((a, b) => b.version - a.version));
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare le versioni",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async () => {
    if (selectedVersion === null) return;

    try {
      setIsReverting(true);
      await dvrApi.revertToVersion(dvrId, selectedVersion);
      
      toast({
        title: "Versione Ripristinata",
        description: `Il DVR è stato ripristinato alla versione ${selectedVersion}`,
      });
      
      setSelectedVersion(null);
      await loadVersions();
      onVersionRestored();
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile ripristinare la versione",
        variant: "destructive"
      });
    } finally {
      setIsReverting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Caricamento versioni...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Storico Versioni
          </CardTitle>
          <CardDescription>
            Visualizza e ripristina versioni precedenti del DVR
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nessuna versione precedente disponibile
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Versione {version.version}</Badge>
                        <Badge variant={mapStatusVariant(version.stato)}>
                          {mapStatusLabel(version.stato)}
                        </Badge>
                        {version.version === currentVersion && (
                          <Badge variant="default">Versione Corrente</Badge>
                        )}
                      </div>
                      {version.version !== currentVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVersion(version.version)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Ripristina
                        </Button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">{version.nome}</h4>
                      {version.descrizione && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {version.descrizione}
                        </p>
                      )}
                    </div>

                    {version.revision_note && (
                      <div className="bg-muted/50 p-3 rounded text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          Nota di revisione:
                        </p>
                        <p>{version.revision_note}</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Creata il {format(new Date(version.created_at), "dd MMMM yyyy 'alle' HH:mm", { locale: it })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={selectedVersion !== null} onOpenChange={(open) => !open && setSelectedVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ripristinare questa versione?</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per ripristinare il DVR alla versione {selectedVersion}. La versione corrente verrà salvata nello storico.
              Questa azione creerà una nuova versione.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReverting}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevert} disabled={isReverting}>
              {isReverting ? "Ripristino..." : "Ripristina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

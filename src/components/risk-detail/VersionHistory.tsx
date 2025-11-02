import { useState, useEffect } from "react";
import { Clock, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { RiskVersion } from "@/types/risk";
import { getRiskVersions, revertRiskToVersion } from "@/lib/riskApi";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface VersionHistoryProps {
  riskId: string;
  currentVersion: number;
  onVersionRestored: () => void;
}

const mapStatusLabel = (state: string): string => {
  switch (state) {
    case 'published':
      return 'Validato';
    case 'archived':
      return 'Attivo';
    case 'draft':
    default:
      return 'Bozza';
  }
};

const mapStatusVariant = (state: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (state) {
    case 'published':
      return 'default';
    case 'archived':
      return 'secondary';
    case 'draft':
    default:
      return 'outline';
  }
};

export const VersionHistory = ({ riskId, currentVersion, onVersionRestored }: VersionHistoryProps) => {
  const [versions, setVersions] = useState<RiskVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    loadVersions();
  }, [riskId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await getRiskVersions(riskId);
      setVersions(data.sort((a, b) => b.version - a.version));
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare lo storico versioni",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async () => {
    if (!selectedVersion) return;

    try {
      setIsReverting(true);
      await revertRiskToVersion(riskId, selectedVersion);
      
      toast({
        title: "Versione ripristinata",
        description: `Il rischio è stato ripristinato alla versione ${selectedVersion}`,
      });

      setSelectedVersion(null);
      await loadVersions();
      onVersionRestored();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile ripristinare la versione",
        variant: "destructive",
      });
    } finally {
      setIsReverting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storico Versioni</CardTitle>
          <CardDescription>Caricamento in corso...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Storico Versioni
          </CardTitle>
          <CardDescription>
            Visualizza e ripristina versioni precedenti del rischio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nessuna versione precedente disponibile
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={version.version === currentVersion ? "default" : "outline"}>
                            Versione {version.version}
                          </Badge>
                          <Badge variant={mapStatusVariant(version.state)}>
                            {mapStatusLabel(version.state)}
                          </Badge>
                          {version.version === currentVersion && (
                            <Badge variant="secondary">Attuale</Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{version.name}</h4>
                          {version.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {version.description}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Creata il {format(new Date(version.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                        </p>
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
                    {index < versions.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={selectedVersion !== null} onOpenChange={() => setSelectedVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma ripristino versione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler ripristinare il rischio alla versione {selectedVersion}?
              La configurazione corrente verrà salvata automaticamente come nuova versione.
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
};

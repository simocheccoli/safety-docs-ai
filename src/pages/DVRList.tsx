import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Calendar, User, Edit, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dvrApi } from "@/lib/dvrApi";
import { DVR } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { statusLabels, statusColors } from "@/components/dvr/DVRInfoEditor";

export default function DVRList() {
  const navigate = useNavigate();
  const [dvrs, setDvrs] = useState<DVR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDVRs();
  }, []);

  const loadDVRs = async () => {
    try {
      setLoading(true);
      const allDvrs = await dvrApi.getDVRList();
      setDvrs(allDvrs);
    } catch (error) {
      console.error("Errore nel caricamento dei DVR:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la lista DVR",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dvrId: string) => {
    try {
      await dvrApi.deleteDVR(dvrId);
      loadDVRs();
      toast({
        title: "DVR Eliminato",
        description: "Il documento è stato rimosso con successo",
      });
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il DVR",
        variant: "destructive",
      });
    }
  };

  const getFileCount = (dvr: DVR) => {
    return (dvr as any).files_count || 0;
  };

  const getIncludedFileCount = (dvr: DVR) => {
    return (dvr as any).included_files_count || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenti di Valutazione dei Rischi</h1>
          <p className="text-muted-foreground">Gestisci e revisiona i tuoi DVR</p>
        </div>
        <Button onClick={() => navigate('/dvr/wizard')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo DVR
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Caricamento...</p>
          </CardContent>
        </Card>
      ) : dvrs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun DVR Presente</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Inizia creando il tuo primo Documento di Valutazione dei Rischi utilizzando il wizard guidato
            </p>
            <Button onClick={() => navigate('/dvr/wizard')}>
              <Plus className="h-4 w-4 mr-2" />
              Crea Primo DVR
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dvrs.map((dvr) => (
            <Card key={dvr.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{dvr.nome}</CardTitle>
                      <Badge className={statusColors[dvr.stato]}>
                        {statusLabels[dvr.stato]}
                      </Badge>
                      <Badge variant="outline">Rev. {dvr.numero_revisione}</Badge>
                    </div>
                    <CardDescription>
                      {dvr.descrizione || `${getIncludedFileCount(dvr)} file inclusi su ${getFileCount(dvr)} totali`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dvr/${dvr.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Apri
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questo DVR? Questa azione non può essere annullata.
                            Verranno eliminati anche tutti i file e le revisioni associate.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(dvr.id)}>
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  {dvr.company ? (
                    <div className="p-4 rounded-lg border-2 bg-card" style={{ borderColor: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary) / 0.05)' }}>
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 mt-0.5" style={{ color: 'hsl(var(--primary))' }} />
                        <div className="flex-1 space-y-2">
                          <div>
                            <span className="font-semibold text-base" style={{ color: 'hsl(var(--primary))' }}>
                              {dvr.company.name}
                            </span>
                          </div>
                          {/* Additional company details can be added here when available */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border-2 bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground italic">Nessuna azienda associata</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Creato: {new Date(dvr.data_creazione).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Modificato: {new Date(dvr.data_ultima_modifica).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Creato da: {dvr.created_by}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Modificato da: {dvr.updated_by}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

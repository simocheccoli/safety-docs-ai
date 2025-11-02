import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, FileCheck, AlertTriangle, FileEdit, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DVR } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { FileDetailCard } from "@/components/dvr/FileDetailCard";
import { DVRInfoEditor, statusLabels, statusColors } from "@/components/dvr/DVRInfoEditor";
import { dvrApi } from "@/lib/dvrApi";
import { DVRVersionHistory } from "@/components/dvr/DVRVersionHistory";
import { SaveRevisionDialog } from "@/components/dvr/SaveRevisionDialog";

export default function DVRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dvr, setDvr] = useState<DVR | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadDVR();
    }
  }, [id]);

  const loadDVR = async () => {
    if (!id) return;
    try {
      const [dvrData, filesData] = await Promise.all([
        dvrApi.getDVR(id),
        dvrApi.getDVRFiles(id)
      ]);
      
      if (dvrData) {
        setDvr(dvrData);
        setFiles(filesData);
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati del DVR",
        variant: "destructive"
      });
    }
  };

  const handleFinalize = async () => {
    if (!id || !dvr) return;
    try {
      await dvrApi.finalize(id, dvr.nome);
      loadDVR();
      toast({
        title: "DVR Finalizzato",
        description: "Il documento è stato finalizzato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile finalizzare il DVR",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!id || !dvr) return;
    
    try {
      setIsSaving(true);
      await dvrApi.updateDVR(id, {
        data_ultima_modifica: new Date().toISOString()
      });
      
      toast({
        title: "Salvato",
        description: "Le modifiche sono state salvate con successo",
      });
      
      loadDVR();
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile salvare le modifiche",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRevision = async (revisionNote: string) => {
    if (!id || !dvr) return;
    
    try {
      setIsSaving(true);
      await dvrApi.saveRevision(id, {}, revisionNote);
      
      toast({
        title: "Revisione Salvata",
        description: "La nuova revisione è stata creata con successo",
      });
      
      setShowRevisionDialog(false);
      loadDVR();
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile salvare la revisione",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFiles = () => {
    navigate(`/dvr/wizard?dvrId=${id}`);
  };

  if (!dvr) {
    return <div>DVR non trovato</div>;
  }

  const includedFiles = files.filter(f => f.inclusione_dvr);
  const excludedFiles = files.filter(f => !f.inclusione_dvr);
  const criticalFiles = files.filter(f => f.stato_elaborazione_ai === 'DA_ATTENZIONARE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dvr')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{dvr.nome}</h1>
              <Badge className={statusColors[dvr.stato]}>
                {statusLabels[dvr.stato]}
              </Badge>
              <Badge variant="outline">Revisione {dvr.numero_revisione}</Badge>
            </div>
            {dvr.descrizione && (
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {dvr.descrizione}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Ultima modifica: {new Date(dvr.data_ultima_modifica).toLocaleString('it-IT')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <DVRInfoEditor dvr={dvr} onUpdate={loadDVR} />
          <Button variant="outline" onClick={handleAddFiles}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi File
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dvr/${id}/document`)}>
            <FileEdit className="h-4 w-4 mr-2" />
            Modifica Documento
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salva
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salva
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRevisionDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Salva Revisione
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {dvr.stato !== 'FINALIZZATO' && dvr.stato !== 'ARCHIVIATO' && (
            <Button onClick={handleFinalize}>
              <FileCheck className="h-4 w-4 mr-2" />
              Finalizza DVR
            </Button>
          )}
        </div>
      </div>

      {criticalFiles.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Attenzione: {criticalFiles.length} file richiedono la tua attenzione prima della finalizzazione
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{files.length}</CardTitle>
            <CardDescription>File Totali</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">{includedFiles.length}</CardTitle>
            <CardDescription>File Inclusi</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-600">{criticalFiles.length}</CardTitle>
            <CardDescription>Da Attenzionare</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">File Elaborati</TabsTrigger>
          <TabsTrigger value="versions">Versioni</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nessun file caricato</p>
                <Button className="mt-4" onClick={handleAddFiles}>
                  <Plus className="h-4 w-4 mr-2" />
                  Carica File
                </Button>
              </CardContent>
            </Card>
          ) : (
            files.map(file => (
              <FileDetailCard 
                key={file.file_id} 
                file={file} 
                onUpdate={loadDVR}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <DVRVersionHistory 
            dvrId={id!} 
            currentVersion={dvr.numero_revisione}
            onVersionRestored={loadDVR}
          />
        </TabsContent>
      </Tabs>

      <SaveRevisionDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        onSave={handleSaveRevision}
        isSaving={isSaving}
      />
    </div>
  );
}

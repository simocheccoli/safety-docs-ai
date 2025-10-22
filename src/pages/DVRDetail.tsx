import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, FileCheck, AlertTriangle, History, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDVRById, updateDVR, getDVRFiles, createNewRevision, getDVRRevisions } from "@/lib/dvrStorage";
import { DVR, DVRRevisione } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { FileDetailCard } from "@/components/dvr/FileDetailCard";

export default function DVRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dvr, setDvr] = useState<DVR | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<DVRRevisione[]>([]);
  const [revisionNote, setRevisionNote] = useState("");

  useEffect(() => {
    if (id) {
      loadDVR();
    }
  }, [id]);

  const loadDVR = () => {
    if (!id) return;
    const dvrData = getDVRById(id);
    if (dvrData) {
      setDvr(dvrData);
      setFiles(getDVRFiles(id));
      setRevisions(getDVRRevisions(id));
    }
  };

  const handleFinalize = () => {
    if (!id) return;
    updateDVR(id, { stato: 'FINALIZZATO', updated_by: 'current_user' });
    loadDVR();
    toast({
      title: "DVR Finalizzato",
      description: "Il documento è stato finalizzato con successo",
    });
  };

  const handleCreateRevision = () => {
    if (!id || !revisionNote.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una nota per la revisione",
        variant: "destructive"
      });
      return;
    }
    
    createNewRevision(id, 'current_user', revisionNote);
    setRevisionNote("");
    loadDVR();
    toast({
      title: "Nuova Revisione Creata",
      description: "La revisione è stata registrata con successo",
    });
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
              <Badge variant={dvr.stato === 'FINALIZZATO' ? 'default' : 'secondary'}>
                {dvr.stato}
              </Badge>
              <Badge variant="outline">Revisione {dvr.numero_revisione}</Badge>
            </div>
            <p className="text-muted-foreground">
              Ultima modifica: {new Date(dvr.data_ultima_modifica).toLocaleString('it-IT')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddFiles}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi File
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dvr/${id}/document`)}>
            <FileEdit className="h-4 w-4 mr-2" />
            Modifica Documento
          </Button>
          {dvr.stato === 'BOZZA' && (
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
          <TabsTrigger value="revisions">Storico Revisioni</TabsTrigger>
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

        <TabsContent value="revisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crea Nuova Revisione</CardTitle>
              <CardDescription>
                Una nuova revisione registra lo stato attuale del DVR con data certa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="revision-note">Note Revisione</Label>
                <Textarea
                  id="revision-note"
                  placeholder="Descrivi le modifiche apportate in questa revisione..."
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateRevision}>
                <History className="h-4 w-4 mr-2" />
                Crea Revisione
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storico Revisioni</CardTitle>
            </CardHeader>
            <CardContent>
              {revisions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nessuna revisione registrata
                </p>
              ) : (
                <div className="space-y-4">
                  {revisions.map((rev) => (
                    <div key={rev.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>Rev. {rev.numero_revisione}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(rev.data_revisione).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <p className="text-sm">{rev.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Utente: {rev.user_id}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

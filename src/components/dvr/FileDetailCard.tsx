import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Edit, Save, Eye, FileText, FileSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateDVRFile } from "@/lib/dvrStorage";
import { FileMetadata } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { VisualJSONEditor } from "./VisualJSONEditor";

interface FileDetailCardProps {
  file: FileMetadata;
  onUpdate: () => void;
}

export function FileDetailCard({ file, onUpdate }: FileDetailCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editedOutput, setEditedOutput] = useState(
    file.output_json_modificato || file.output_json_completo
  );
  const [notes, setNotes] = useState(file.note_rspp || "");
  const [included, setIncluded] = useState(file.inclusione_dvr);

  const handleSave = () => {
    updateDVRFile(file.file_id, {
      output_json_modificato: editedOutput,
      modificato_manualmente: true,
      note_rspp: notes,
      inclusione_dvr: included
    });
    setIsDialogOpen(false);
    onUpdate();
    toast({
      title: "Modifiche Salvate",
      description: "I dati del file sono stati aggiornati",
    });
  };

  const handleInclusionChange = (checked: boolean) => {
    setIncluded(checked);
    updateDVRFile(file.file_id, {
      inclusione_dvr: checked
    });
    onUpdate();
  };

  const handleNotesChange = () => {
    updateDVRFile(file.file_id, {
      note_rspp: notes
    });
    onUpdate();
    toast({
      title: "Note Salvate",
      description: "Le note RSPP sono state aggiornate",
    });
  };

  const getStatusIcon = () => {
    switch (file.stato_elaborazione_ai) {
      case 'POSITIVO':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'NEGATIVO':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'DA_ATTENZIONARE':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (file.stato_elaborazione_ai) {
      case 'POSITIVO':
        return 'text-green-600';
      case 'NEGATIVO':
        return 'text-red-600';
      case 'DA_ATTENZIONARE':
        return 'text-yellow-600';
      default:
        return '';
    }
  };

  const displayOutput = file.output_json_modificato || file.output_json_completo;

  return (
    <Card className={file.stato_elaborazione_ai === 'DA_ATTENZIONARE' ? 'border-yellow-500 border-2' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1">
              <CardTitle className="text-base">{file.nome_file}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{file.rischio_nome}</Badge>
                <span className={`text-sm ${getStatusColor()}`}>
                  {file.stato_elaborazione_ai}
                </span>
                {file.modificato_manualmente && (
                  <Badge variant="secondary">Modificato Manualmente</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileSearch className="h-4 w-4 mr-2" />
                  Anteprima
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Anteprima File - {file.nome_file}
                  </DialogTitle>
                  <DialogDescription>
                    Contenuto originale del file caricato
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 mt-4">
                  {file.file_content ? (
                    <pre className="whitespace-pre-wrap text-sm font-mono p-4 bg-muted rounded-lg">
                      {file.file_content}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>Contenuto del file non disponibile</p>
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica Dati
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {file.nome_file}
                  </DialogTitle>
                  <DialogDescription>
                    Confronta il file originale con i dati estratti e modifica la struttura come necessario
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                  {/* File Originale */}
                  <div className="flex flex-col border rounded-lg overflow-hidden">
                    <div className="p-3 border-b bg-muted flex-shrink-0">
                      <h3 className="font-semibold text-sm">File Originale</h3>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-4">
                        {file.file_content ? (
                          <pre className="whitespace-pre-wrap text-xs font-mono">
                            {file.file_content}
                          </pre>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Contenuto non disponibile</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Editor Visuale JSON */}
                  <div className="flex flex-col border rounded-lg overflow-hidden">
                    <div className="p-3 border-b bg-muted flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Dati Estratti</h3>
                        {file.modificato_manualmente && (
                          <Badge variant="secondary">Modificato</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Modifica, aggiungi o rimuovi campi dalla struttura
                      </p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-4">
                        <VisualJSONEditor
                          data={editedOutput}
                          onChange={setEditedOutput}
                        />
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <span className={getStatusColor()}>
                      {file.motivazione_stato}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annulla
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Salva Modifiche
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="flex items-center gap-2 border-l pl-3">
              <Switch
                checked={included}
                onCheckedChange={handleInclusionChange}
                id={`include-${file.file_id}`}
              />
              <Label htmlFor={`include-${file.file_id}`} className="cursor-pointer text-sm">
                Includi
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Rischio</Label>
            <p className="font-medium">{file.rischio_nome}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Dimensione</Label>
            <p className="font-medium">{(file.file_size / 1024).toFixed(2)} KB</p>
          </div>
        </div>

        <div>
          <Label htmlFor={`notes-${file.file_id}`} className="text-sm">Note RSPP</Label>
          <div className="flex gap-2 mt-2">
            <Textarea
              id={`notes-${file.file_id}`}
              placeholder="Aggiungi note o osservazioni..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleNotesChange}>
              Salva
            </Button>
          </div>
        </div>

        {Object.keys(displayOutput).length > 0 && (
          <div>
            <Label className="text-sm mb-2 block">Riepilogo Dati</Label>
            <div className="bg-muted p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(displayOutput).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium truncate">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
              {Object.keys(displayOutput).length > 4 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  +{Object.keys(displayOutput).length - 4} altri campi
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

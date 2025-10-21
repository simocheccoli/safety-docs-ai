import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Edit, Save, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateDVRFile } from "@/lib/dvrStorage";
import { FileMetadata } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";

interface FileDetailCardProps {
  file: FileMetadata;
  onUpdate: () => void;
}

export function FileDetailCard({ file, onUpdate }: FileDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOutput, setEditedOutput] = useState(
    JSON.stringify(file.output_json_modificato || file.output_json_completo, null, 2)
  );
  const [notes, setNotes] = useState(file.note_rspp || "");
  const [included, setIncluded] = useState(file.inclusione_dvr);

  const handleSave = () => {
    try {
      const parsedOutput = JSON.parse(editedOutput);
      updateDVRFile(file.file_id, {
        output_json_modificato: parsedOutput,
        modificato_manualmente: true,
        note_rspp: notes,
        inclusione_dvr: included
      });
      setIsEditing(false);
      onUpdate();
      toast({
        title: "Modifiche Salvate",
        description: "I dati del file sono stati aggiornati",
      });
    } catch (e) {
      toast({
        title: "Errore",
        description: "Il JSON inserito non è valido",
        variant: "destructive"
      });
    }
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
                  <Badge variant="secondary">Modificato</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Anteprima
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{file.nome_file}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="extracted" className="w-full">
                  <TabsList>
                    <TabsTrigger value="extracted">Dati Estratti</TabsTrigger>
                    {file.file_content && (
                      <TabsTrigger value="original">File Originale</TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="extracted" className="space-y-4">
                    <div>
                      <Label>Output AI {file.modificato_manualmente && "(Modificato)"}</Label>
                      <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs mt-2">
                        {JSON.stringify(displayOutput, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Label>Motivazione Stato</Label>
                      <p className="text-sm mt-2">{file.motivazione_stato}</p>
                    </div>
                  </TabsContent>
                  {file.file_content && (
                    <TabsContent value="original">
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{file.file_content}</pre>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </DialogContent>
            </Dialog>
            <Switch
              checked={included}
              onCheckedChange={setIncluded}
              id={`include-${file.file_id}`}
            />
            <Label htmlFor={`include-${file.file_id}`} className="cursor-pointer">
              Includi
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <Label>Modifica Output JSON</Label>
              <Textarea
                value={editedOutput}
                onChange={(e) => setEditedOutput(e.target.value)}
                rows={10}
                className="font-mono text-xs mt-2"
              />
            </div>
            <div>
              <Label>Note RSPP</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salva Modifiche
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annulla
              </Button>
            </div>
          </>
        ) : (
          <>
            {file.note_rspp && (
              <div>
                <Label>Note RSPP</Label>
                <p className="text-sm mt-1">{file.note_rspp}</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifica Dati Estratti
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

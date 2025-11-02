import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileWithClassification } from "@/types/dvr";
import { dvrApi } from "@/lib/dvrApi";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FileReviewStepProps {
  files: FileWithClassification[];
  existingDvrId?: string;
  onComplete: (dvrId: string) => void;
  onBack: () => void;
}

export function FileReviewStep({ files, existingDvrId, onComplete, onBack }: FileReviewStepProps) {
  const [reviewedFiles, setReviewedFiles] = useState<FileWithClassification[]>(files);
  const [dvrName, setDvrName] = useState<string>(`DVR ${new Date().toLocaleDateString('it-IT')}`);
  const [saving, setSaving] = useState(false);

  const handleInclusionChange = (fileId: string, included: boolean) => {
    setReviewedFiles(prev => prev.map(f =>
      f.metadata.file_id === fileId
        ? { ...f, metadata: { ...f.metadata, inclusione_dvr: included } }
        : f
    ));
  };

  const handleNotesChange = (fileId: string, notes: string) => {
    setReviewedFiles(prev => prev.map(f =>
      f.metadata.file_id === fileId
        ? { ...f, metadata: { ...f.metadata, note_rspp: notes } }
        : f
    ));
  };

  const handleSaveAndComplete = async () => {
    if (!dvrName.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per il DVR",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      // Crea il DVR con i file tramite API
      const createdDvr = await dvrApi.createDVR(
        dvrName,
        reviewedFiles.map(f => f.file)
      );

      // Aggiorna le classificazioni e le inclusioni per ogni file
      const fileUpdatePromises = reviewedFiles.map(async (fileObj, index) => {
        // Il backend restituisce i file, dobbiamo trovare il file corrispondente
        const backendFile = (createdDvr as any).files?.[index];
        if (!backendFile) return;

        await dvrApi.updateFile(
          createdDvr.id,
          backendFile.id,
          {
            rischio_associato: fileObj.metadata.rischio_associato,
            inclusione_dvr: fileObj.metadata.inclusione_dvr,
            note_rspp: fileObj.metadata.note_rspp,
          }
        );
      });

      await Promise.all(fileUpdatePromises);

      toast({
        title: "DVR Creato",
        description: `${reviewedFiles.length} documenti sono stati salvati con successo`,
      });

      onComplete(createdDvr.id);
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il DVR. Riprova.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
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

  const getStatusColor = (status?: string) => {
    switch (status) {
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

  const includedCount = reviewedFiles.filter(f => f.metadata.inclusione_dvr).length;
  const excludedCount = reviewedFiles.length - includedCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisione Finale</CardTitle>
        <CardDescription>
          Verifica i risultati e gestisci l'inclusione nel DVR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Attenzione:</strong> Verifica attentamente i dati estratti prima di finalizzare.
            Le decisioni prese qui hanno valore legale per la valutazione dei rischi.
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="dvr-name">Nome DVR</Label>
          <Input
            id="dvr-name"
            value={dvrName}
            onChange={(e) => setDvrName(e.target.value)}
            placeholder="Inserisci nome DVR..."
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold">{reviewedFiles.length}</p>
            <p className="text-sm text-muted-foreground">Documenti Totali</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{includedCount}</p>
            <p className="text-sm text-muted-foreground">Inclusi nel DVR</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{excludedCount}</p>
            <p className="text-sm text-muted-foreground">Esclusi</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {reviewedFiles.map((fileObj) => (
            <AccordionItem key={fileObj.metadata.file_id} value={fileObj.metadata.file_id!}>
              <AccordionTrigger>
                <div className="flex items-center gap-3 flex-1 text-left">
                  {getStatusIcon(fileObj.metadata.stato_elaborazione_ai)}
                  <div className="flex-1">
                    <p className="font-medium">{fileObj.metadata.nome_file}</p>
                    <p className="text-sm text-muted-foreground">
                      {fileObj.metadata.rischio_nome} - 
                      <span className={`ml-1 ${getStatusColor(fileObj.metadata.stato_elaborazione_ai)}`}>
                        {fileObj.metadata.stato_elaborazione_ai}
                      </span>
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Motivazione Stato:</p>
                    <p className="text-sm text-muted-foreground">
                      {fileObj.metadata.motivazione_stato}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Dati Estratti:</p>
                    <pre className="bg-muted p-3 rounded-lg overflow-auto text-xs">
                      {JSON.stringify(fileObj.metadata.output_json_completo, null, 2)}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <Label htmlFor={`include-${fileObj.metadata.file_id}`}>
                      Includi nel DVR
                    </Label>
                    <Switch
                      id={`include-${fileObj.metadata.file_id}`}
                      checked={fileObj.metadata.inclusione_dvr}
                      onCheckedChange={(checked) => 
                        handleInclusionChange(fileObj.metadata.file_id!, checked)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`notes-${fileObj.metadata.file_id}`}>
                      Note RSPP
                    </Label>
                    <Textarea
                      id={`notes-${fileObj.metadata.file_id}`}
                      placeholder="Aggiungi note o osservazioni..."
                      value={fileObj.metadata.note_rspp || ""}
                      onChange={(e) => 
                        handleNotesChange(fileObj.metadata.file_id!, e.target.value)
                      }
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onBack} disabled={saving}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <Button onClick={handleSaveAndComplete} size="lg" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvataggio..." : "Salva e Completa"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

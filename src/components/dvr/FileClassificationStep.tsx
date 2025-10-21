import { useState, useEffect } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileWithClassification } from "@/types/dvr";
import { getRiskTypes } from "@/lib/riskStorage";
import { RiskType } from "@/types/risk";
import { toast } from "@/hooks/use-toast";

interface FileClassificationStepProps {
  files: FileWithClassification[];
  onComplete: (files: FileWithClassification[]) => void;
  onBack: () => void;
}

export function FileClassificationStep({ files, onComplete, onBack }: FileClassificationStepProps) {
  const [classifiedFiles, setClassifiedFiles] = useState<FileWithClassification[]>(files);
  const [risks, setRisks] = useState<RiskType[]>([]);

  useEffect(() => {
    const loadedRisks = getRiskTypes();
    setRisks(loadedRisks);
  }, []);

  const handleRiskChange = (fileId: string, riskId: string) => {
    const selectedRisk = risks.find(r => r.id === riskId);
    setClassifiedFiles(prev => prev.map(f => 
      f.metadata.file_id === fileId 
        ? { 
            ...f, 
            metadata: { 
              ...f.metadata, 
              rischio_associato: riskId,
              rischio_nome: selectedRisk?.name || ''
            } 
          }
        : f
    ));
  };

  const handleContinue = () => {
    const unclassified = classifiedFiles.filter(f => !f.metadata.rischio_associato);
    if (unclassified.length > 0) {
      toast({
        title: "Classificazione incompleta",
        description: "Assegna un rischio a tutti i file prima di continuare",
        variant: "destructive",
      });
      return;
    }
    onComplete(classifiedFiles);
  };

  const allClassified = classifiedFiles.every(f => f.metadata.rischio_associato);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classificazione Documenti</CardTitle>
        <CardDescription>
          Assegna ogni documento alla categoria di rischio corrispondente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Seleziona il tipo di rischio per ogni documento. Questo determinerà quale prompt AI verrà utilizzato per l'analisi.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {classifiedFiles.map((fileObj) => (
            <div key={fileObj.metadata.file_id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{fileObj.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(fileObj.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`risk-${fileObj.metadata.file_id}`}>
                  Categoria di Rischio
                </Label>
                <Select
                  value={fileObj.metadata.rischio_associato || ""}
                  onValueChange={(value) => handleRiskChange(fileObj.metadata.file_id!, value)}
                >
                  <SelectTrigger id={`risk-${fileObj.metadata.file_id}`}>
                    <SelectValue placeholder="Seleziona un rischio" />
                  </SelectTrigger>
                  <SelectContent>
                    {risks.map((risk) => (
                      <SelectItem key={risk.id} value={risk.id}>
                        {risk.name} - {risk.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!allClassified}
            size="lg"
          >
            Continua all'Elaborazione AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

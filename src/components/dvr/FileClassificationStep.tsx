import { useState, useEffect } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getRiskTypes } from "@/lib/riskApi";
import { RiskType } from "@/types/risk";
import { FileWithClassification } from "@/types/dvr";

interface FileClassificationStepProps {
  files: File[];
  onClassified: (classifiedFiles: FileWithClassification[]) => void;
  onBack: () => void;
}

export function FileClassificationStep({ files, onClassified, onBack }: FileClassificationStepProps) {
  const [risks, setRisks] = useState<RiskType[]>([]);
  const [classifications, setClassifications] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const allRisks = await getRiskTypes();
      // Filtra solo i rischi attivi
      setRisks(allRisks.filter(r => r.status === 'active'));
    } catch (error) {
      console.error("Errore nel caricamento dei rischi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassification = (fileName: string, riskId: string) => {
    setClassifications(prev => ({
      ...prev,
      [fileName]: parseInt(riskId)
    }));
  };

  const handleContinue = () => {
    const classifiedFiles: FileWithClassification[] = files.map(file => ({
      file,
      metadata: {
        file_name: file.name,
        risk_id: classifications[file.name] || risks[0]?.id ? parseInt(risks[0].id) : 0,
        include: true,
        notes: ''
      }
    }));

    onClassified(classifiedFiles);
  };

  const allClassified = files.every(file => 
    classifications[file.name] !== undefined || risks.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classificazione Documenti</CardTitle>
        <CardDescription>
          Associa ogni documento al rischio corrispondente per una corretta elaborazione
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Caricamento rischi...</p>
          </div>
        ) : risks.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nessun rischio attivo trovato. Crea almeno un rischio attivo prima di classificare i documenti.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                Seleziona il tipo di rischio per ogni documento caricato. Questa classificazione aiuterà 
                il sistema a processare correttamente i documenti.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="w-64">
                    <Select
                      value={classifications[file.name]?.toString() || risks[0]?.id || ""}
                      onValueChange={(value) => handleClassification(file.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona rischio" />
                      </SelectTrigger>
                      <SelectContent>
                        {risks.map((risk) => (
                          <SelectItem key={risk.id} value={risk.id}>
                            {risk.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onBack}>
            Indietro
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!allClassified || risks.length === 0}
            size="lg"
          >
            Continua al Processing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

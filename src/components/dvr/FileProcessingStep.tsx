import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileWithClassification } from "@/types/dvr";

interface FileProcessingStepProps {
  files: FileWithClassification[];
  dvrId: string;
  onComplete: () => void;
  onBack: () => void;
}

interface ProcessingStatus {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

export function FileProcessingStep({ files, dvrId, onComplete, onBack }: FileProcessingStepProps) {
  const [processing, setProcessing] = useState(false);
  const [statuses, setStatuses] = useState<ProcessingStatus[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Inizializza gli stati
    setStatuses(files.map(f => ({
      fileName: f.file.name,
      status: 'pending'
    })));
  }, [files]);

  const startProcessing = async () => {
    setProcessing(true);
    
    // Simula il processing dei file
    for (let i = 0; i < files.length; i++) {
      setStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'processing', message: 'Elaborazione in corso...' } : s
      ));
      
      // Simula un delay per il processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'completed', message: 'Completato' } : s
      ));
      
      setProgress(((i + 1) / files.length) * 100);
    }
    
    setProcessing(false);
  };

  const allCompleted = statuses.every(s => s.status === 'completed');
  const hasErrors = statuses.some(s => s.status === 'error');

  const getStatusIcon = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Elaborazione Documenti</CardTitle>
        <CardDescription>
          I documenti vengono processati e preparati per l'inclusione nel DVR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!processing && !allCompleted && (
          <Alert>
            <AlertDescription>
              Clicca su "Avvia Elaborazione" per iniziare il processing dei documenti. 
              Questo processo può richiedere alcuni minuti.
            </AlertDescription>
          </Alert>
        )}

        {(processing || allCompleted) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avanzamento</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="space-y-3">
              {statuses.map((status, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(status.status)}
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{status.fileName}</p>
                    {status.message && (
                      <p className="text-xs text-muted-foreground">{status.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Alcuni file hanno riscontrato errori durante l'elaborazione. 
              Puoi comunque continuare, ma verifica i file problematici.
            </AlertDescription>
          </Alert>
        )}

        {allCompleted && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Tutti i documenti sono stati elaborati con successo!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={processing}
          >
            Indietro
          </Button>
          
          {!processing && !allCompleted && (
            <Button onClick={startProcessing} size="lg">
              Avvia Elaborazione
            </Button>
          )}
          
          {allCompleted && (
            <Button onClick={onComplete} size="lg">
              Continua alla Revisione
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

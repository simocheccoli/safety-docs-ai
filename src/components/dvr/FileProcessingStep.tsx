import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileWithClassification } from "@/types/dvr";
import { toast } from "sonner";

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
  result?: 'POSITIVO' | 'NEGATIVO';
  extractedData?: any;
}

// Mock data per la demo - diversi tipi di rischio
const MOCK_EXTRACTION_RESULTS: Record<string, { positivo: any; negativo: any }> = {
  fonometrico: {
    positivo: {
      postazione_lavoro: "Reparto Produzione - Linea 1",
      livello_esposizione_leq: 87.5,
      livello_esposizione_lex8h: 84.2,
      livello_picco: 132.0,
      classe_rischio: "Alto",
      superamento_limiti: false,
      mansioni_esposte: [
        "Operatore macchine CNC",
        "Addetto assemblaggio",
        "Carrellista"
      ],
      sorgenti_rumore: [
        "Torni CNC (85 dB)",
        "Compressore aria (92 dB)",
        "Avvitatori pneumatici (88 dB)",
        "Nastro trasportatore (78 dB)"
      ],
      dpi_uditivi: [
        "Inserti auricolari 3M 1100 (SNR 37 dB)",
        "Cuffie antirumore Peltor X4A (SNR 33 dB)"
      ],
      misure_prevenzione: [
        "Installazione cabine fonoisolanti per torni",
        "Manutenzione programmata compressore",
        "Rotazione personale ogni 4 ore",
        "Segnaletica aree ad alto rumore",
        "Formazione annuale rischio rumore"
      ],
      sorveglianza_sanitaria: true,
      formazione_richiesta: true,
      data_misurazione: "2024-11-15",
      tecnico_competente: "Ing. Marco Verdi - Albo n. 1234",
      strumentazione: "Fonometro Classe 1 - Bruel & Kjaer 2250",
      normativa_riferimento: "D.Lgs. 81/2008 - Titolo VIII Capo II"
    },
    negativo: {
      postazione_lavoro: "Area non identificata",
      livello_esposizione_leq: null,
      classe_rischio: "Non determinabile",
      note: "Documento incompleto - mancano dati fonometrici. Necessaria nuova misurazione.",
      conforme: false
    }
  },
  chimico: {
    positivo: {
      sostanza: "Acetone industriale",
      livello_rischio: "Medio",
      misure_prevenzione: ["DPI specifici", "Ventilazione adeguata", "Formazione periodica"],
      dpi_necessari: ["Guanti nitrile", "Occhiali protettivi", "Maschera FFP2"]
    },
    negativo: {
      sostanza: "Non identificata",
      livello_rischio: null,
      note: "Documento incompleto - mancano schede SDS"
    }
  },
  biologico: {
    positivo: {
      agente_biologico: "Batteri Gram-negativi",
      classe_rischio: 2,
      procedure_sicurezza: ["Disinfezione superfici", "DPI barriera", "Vaccinazione raccomandata"]
    },
    negativo: {
      agente_biologico: "Non identificato",
      classe_rischio: null,
      note: "Protocolli non conformi"
    }
  },
  ergonomico: {
    positivo: {
      attivita: "Movimentazione manuale carichi",
      indice_rischio: 2.8,
      interventi: ["Ausili meccanici", "Formazione posturale", "Rotazione mansioni"]
    },
    negativo: {
      attivita: "Non valutabile",
      indice_rischio: null,
      note: "Dati insufficienti per valutazione NIOSH"
    }
  }
};

// Mappa risk_id a tipo di mock
const getRiskMockType = (riskId: number): string => {
  switch (riskId) {
    case 1: return 'fonometrico';
    case 2: return 'chimico';
    case 3: return 'biologico';
    case 4: return 'ergonomico';
    default: return 'fonometrico';
  }
};

export function FileProcessingStep({ files, dvrId, onComplete, onBack }: FileProcessingStepProps) {
  const [processing, setProcessing] = useState(false);
  const [statuses, setStatuses] = useState<ProcessingStatus[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setStatuses(files.map(f => ({
      fileName: f.file.name,
      status: 'pending'
    })));
  }, [files]);

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processMockFile = async (file: FileWithClassification, index: number): Promise<{ result: 'POSITIVO' | 'NEGATIVO'; data: any }> => {
    // Simula elaborazione con delay realistici
    await simulateDelay(800 + Math.random() * 500);
    
    // Alterna risultati per demo (più positivi che negativi)
    const isPositive = index % 3 !== 2; // 2/3 positivi, 1/3 negativi
    
    // Usa il tipo di rischio dal file classificato
    const riskType = getRiskMockType(file.metadata.risk_id);
    const mockData = MOCK_EXTRACTION_RESULTS[riskType] || MOCK_EXTRACTION_RESULTS.fonometrico;
    
    return {
      result: isPositive ? 'POSITIVO' : 'NEGATIVO',
      data: isPositive ? mockData.positivo : mockData.negativo
    };
  };

  const startProcessing = async () => {
    setProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      const fileWithClass = files[i];
      const file = fileWithClass.file;

      setStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'processing', message: 'Lettura file...' } : s
      ));

      try {
        await simulateDelay(500);
        
        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Estrazione contenuto...' } : s
        ));
        
        await simulateDelay(600);

        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Caricamento configurazione rischio...' } : s
        ));
        
        await simulateDelay(400);

        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Elaborazione AI in corso...' } : s
        ));
        
        const aiResult = await processMockFile(fileWithClass, i);

        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Salvataggio risultati...' } : s
        ));
        
        await simulateDelay(300);

        // In demo mode, skip actual API call
        console.log(`[DEMO] File ${file.name} processed:`, aiResult);

        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { 
            ...s, 
            status: 'completed', 
            message: `Completato - ${aiResult.result}`,
            result: aiResult.result,
            extractedData: aiResult.data
          } : s
        ));
      } catch (error: any) {
        console.error(`Error processing file ${file.name}:`, error);
        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { 
            ...s, 
            status: 'error', 
            message: error.message || 'Errore durante l\'elaborazione' 
          } : s
        ));
        toast.error(`Errore nell'elaborazione di ${file.name}`);
      }
      
      setProgress(((i + 1) / files.length) * 100);
    }
    
    setProcessing(false);
    toast.success('Elaborazione completata!');
  };

  const allCompleted = statuses.every(s => s.status === 'completed' || s.status === 'error');
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
        <CardTitle>Elaborazione Documenti AI</CardTitle>
        <CardDescription>
          I documenti vengono analizzati con AI per estrarre le informazioni strutturate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!processing && !allCompleted && (
          <Alert>
            <AlertDescription>
              Clicca su "Avvia Elaborazione AI" per analizzare i documenti. 
              Ogni file verrà processato con il prompt AI del rischio associato.
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
                <div key={index} className="border rounded-lg">
                  <div className="flex items-center gap-3 p-3">
                    {getStatusIcon(status.status)}
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{status.fileName}</p>
                      {status.message && (
                        <p className="text-xs text-muted-foreground">{status.message}</p>
                      )}
                    </div>
                    {status.result && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        status.result === 'POSITIVO' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                      }`}>
                        {status.result}
                      </div>
                    )}
                  </div>
                  {status.extractedData && (
                    <div className="px-3 pb-3">
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <pre className="overflow-x-auto">
                          {JSON.stringify(status.extractedData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
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

        {allCompleted && !hasErrors && (
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
              Avvia Elaborazione AI
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

import { useState } from "react";
import { ArrowLeft, Play, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileWithClassification, ElaborationStatus } from "@/types/dvr";
import { getRiskTypeById } from "@/lib/riskStorage";
import { toast } from "@/hooks/use-toast";
import OpenAI from "openai";
import { extractText } from "unpdf";

interface FileProcessingStepProps {
  files: FileWithClassification[];
  apiKey: string;
  setApiKey: (key: string) => void;
  onComplete: (files: FileWithClassification[]) => void;
  onBack: () => void;
}

export function FileProcessingStep({ files, apiKey, setApiKey, onComplete, onBack }: FileProcessingStepProps) {
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<FileWithClassification[]>(files);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);
  const [progress, setProgress] = useState(0);

  const readFileContent = async (file: File): Promise<string> => {
    // Handle PDF files
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await extractText(new Uint8Array(arrayBuffer));
        // extractText returns an object with text property that can be string or array
        const text = Array.isArray(result.text) ? result.text.join('\n') : result.text;
        return text;
      } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Impossibile estrarre il testo dal PDF');
      }
    }
    
    // Handle text files
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Errore nella lettura del file"));
      reader.readAsText(file);
    });
  };

  const analyzeWithAI = async (fileContent: string, prompt: string): Promise<any> => {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: `Analizza il seguente documento e estrai le informazioni richieste:\n\n${fileContent}`
        }
      ],
      response_format: {
        type: "json_object"
      }
    });

    const responseContent = completion.choices[0].message.content;
    return JSON.parse(responseContent || "{}");
  };

  const determineStatus = (output: any, outputStructure: any[]): { status: ElaborationStatus, motivation: string } => {
    // Verifica campi obbligatori
    const requiredFields = outputStructure.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !(f.name in output) || !output[f.name]);

    if (missingFields.length > 0) {
      return {
        status: 'NEGATIVO',
        motivation: `NEGATIVO: Dati mancanti - ${missingFields.map(f => f.name).join(', ')}`
      };
    }

    // Cerca indicatori di criticità nel contenuto
    const outputStr = JSON.stringify(output).toLowerCase();
    const criticalKeywords = ['superamento', 'critico', 'elevato', 'attenzione', 'limite superato', 'rischio alto'];
    const hasCriticalIndicator = criticalKeywords.some(keyword => outputStr.includes(keyword));

    if (hasCriticalIndicator) {
      return {
        status: 'DA_ATTENZIONARE',
        motivation: 'DA ATTENZIONARE: Rilevati elementi critici nel documento che richiedono revisione'
      };
    }

    return {
      status: 'POSITIVO',
      motivation: 'POSITIVO: Estrazione dati completata con successo'
    };
  };

  const processFiles = async () => {
    if (!apiKey) {
      toast({
        title: "Errore",
        description: "Inserisci la tua API Key di OpenAI",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const updatedFiles: FileWithClassification[] = [...processedFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      setCurrentFileIndex(i);
      const fileObj = updatedFiles[i];

      try {
        // Aggiorna stato a IN_ELABORAZIONE
        updatedFiles[i].metadata.stato_elaborazione_ai = 'IN_ELABORAZIONE';
        setProcessedFiles([...updatedFiles]);

        // Carica il rischio associato
        const risk = getRiskTypeById(fileObj.metadata.rischio_associato!);
        if (!risk) {
          throw new Error("Rischio non trovato");
        }

        // Leggi contenuto file
        let fileContent: string;
        try {
          fileContent = await readFileContent(fileObj.file);
        } catch (error) {
          console.error(`Error reading file ${fileObj.file.name}:`, error);
          fileContent = `[Contenuto non disponibile per ${fileObj.file.type}]`;
        }

        // Analizza con AI
        const output = await analyzeWithAI(fileContent, risk.aiPrompt);

        // Determina stato
        const { status, motivation } = determineStatus(output, risk.outputStructure);

        // Aggiorna metadata
        updatedFiles[i].metadata = {
          ...updatedFiles[i].metadata,
          file_content: fileContent,
          stato_elaborazione_ai: status,
          motivazione_stato: motivation,
          output_json_completo: output,
          modificato_manualmente: false,
          updated_at: new Date().toISOString()
        };

        setProcessedFiles([...updatedFiles]);
        setProgress(((i + 1) / updatedFiles.length) * 100);

      } catch (error: any) {
        updatedFiles[i].metadata = {
          ...updatedFiles[i].metadata,
          stato_elaborazione_ai: 'NEGATIVO',
          motivazione_stato: `NEGATIVO: Errore durante l'elaborazione - ${error.message}`,
          output_json_completo: {},
          updated_at: new Date().toISOString()
        };
        setProcessedFiles([...updatedFiles]);
      }
    }

    setProcessing(false);
    setCurrentFileIndex(-1);
    toast({
      title: "Elaborazione completata",
      description: "Tutti i file sono stati elaborati",
    });
  };

  const handleContinue = () => {
    onComplete(processedFiles);
  };

  const allProcessed = processedFiles.every(f => 
    f.metadata.stato_elaborazione_ai && f.metadata.stato_elaborazione_ai !== 'IN_ELABORAZIONE'
  );

  const getStatusIcon = (status?: ElaborationStatus) => {
    switch (status) {
      case 'POSITIVO':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'NEGATIVO':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'DA_ATTENZIONARE':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'IN_ELABORAZIONE':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Elaborazione AI</CardTitle>
        <CardDescription>
          Analizza i documenti utilizzando l'intelligenza artificiale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            L'AI analizzerà ogni documento utilizzando il prompt specifico del rischio associato.
            Questo processo potrebbe richiedere alcuni minuti.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={processing}
              className="mt-2"
            />
          </div>

          {!processing && !allProcessed && (
            <Button onClick={processFiles} disabled={!apiKey} size="lg" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Avvia Elaborazione AI
            </Button>
          )}

          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Elaborazione in corso...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Stato Elaborazione</h3>
          {processedFiles.map((fileObj, index) => (
            <div 
              key={fileObj.metadata.file_id} 
              className={`p-4 border rounded-lg ${currentFileIndex === index ? 'border-primary bg-primary/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(fileObj.metadata.stato_elaborazione_ai)}
                    <p className="font-medium">{fileObj.file.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rischio: {fileObj.metadata.rischio_nome}
                  </p>
                  {fileObj.metadata.motivazione_stato && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {fileObj.metadata.motivazione_stato}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onBack} disabled={processing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!allProcessed}
            size="lg"
          >
            Continua alla Revisione
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

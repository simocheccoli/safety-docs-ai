import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileWithClassification } from "@/types/dvr";
import { getRiskTypeById } from "@/lib/riskApi";
import { dvrApi } from "@/lib/dvrApi";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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

export function FileProcessingStep({ files, dvrId, onComplete, onBack }: FileProcessingStepProps) {
  const [processing, setProcessing] = useState(false);
  const [statuses, setStatuses] = useState<ProcessingStatus[]>([]);
  const [progress, setProgress] = useState(0);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setStatuses(files.map(f => ({
      fileName: f.file.name,
      status: 'pending'
    })));
  }, [files]);

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          if (!content) {
            reject(new Error('No content read from file'));
            return;
          }

          if (file.type === 'application/pdf') {
            const pdfText = await extractTextFromPDF(content as ArrayBuffer);
            resolve(pdfText);
          } else {
            resolve(content as string);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const processFileWithAI = async (
    fileContent: string,
    riskPrompt: string,
    outputStructure: any[]
  ): Promise<{ result: 'POSITIVO' | 'NEGATIVO'; data: any }> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: riskPrompt },
          { role: 'user', content: `Analizza il seguente documento:\n\n${fileContent}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON response
    let extractedData: any;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = { raw_response: aiResponse };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      extractedData = { raw_response: aiResponse };
    }

    // Validate if required fields are present
    const hasAllRequiredFields = outputStructure
      .filter(field => field.required)
      .every(field => extractedData[field.name] !== undefined && extractedData[field.name] !== null);

    return {
      result: hasAllRequiredFields ? 'POSITIVO' : 'NEGATIVO',
      data: extractedData
    };
  };

  const startProcessing = async () => {
    if (!apiKey) {
      toast.error('Inserisci una chiave API di OpenAI');
      return;
    }

    setProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      const fileWithClass = files[i];
      const file = fileWithClass.file;
      const riskId = fileWithClass.metadata.risk_id;

      setStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'processing', message: 'Lettura file...' } : s
      ));

      try {
        // Read file content
        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Estrazione contenuto...' } : s
        ));
        const fileContent = await readFileContent(file);

        // Get risk configuration
        if (!riskId) {
          throw new Error('Nessun rischio associato al file');
        }

        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Caricamento configurazione rischio...' } : s
        ));
        const risk = await getRiskTypeById(riskId.toString());
        
        if (!risk || !risk.aiPrompt) {
          throw new Error('Configurazione rischio non trovata o prompt AI mancante');
        }

        // Process with AI
        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Elaborazione AI in corso...' } : s
        ));
        const aiResult = await processFileWithAI(
          fileContent,
          risk.aiPrompt,
          risk.outputStructure
        );

        // Update file with results
        setStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, message: 'Salvataggio risultati...' } : s
        ));

        // Find the file ID from the DVR
        const dvrFiles = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/dvrs/${dvrId}/files`);
        const filesData = await dvrFiles.json();
        const fileRecord = filesData.find((f: any) => f.file_name === file.name);
        
        if (fileRecord?.id) {
          await dvrApi.updateFile(dvrId, fileRecord.id.toString(), {
            classification_result: aiResult.result,
            extraction_data: aiResult.data
          });
        }

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
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Chiave API OpenAI</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Inserisci la tua chiave API di OpenAI per l'elaborazione AI
              </p>
            </div>

            <Alert>
              <AlertDescription>
                Clicca su "Avvia Elaborazione AI" per analizzare i documenti. 
                Ogni file verrà processato con il prompt AI del rischio associato.
              </AlertDescription>
            </Alert>
          </>
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
            <Button onClick={startProcessing} size="lg" disabled={!apiKey}>
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

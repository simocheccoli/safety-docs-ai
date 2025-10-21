import { useState, useEffect } from "react";
import { Upload, Play, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import OpenAI from "openai";
import * as pdfjsLib from 'pdfjs-dist';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";


interface TestTabProps {
  riskId?: string;
  inputExpectations: string;
  outputStructure: any[];
  aiPrompt: string;
}

export function TestTab({ riskId, inputExpectations, outputStructure, aiPrompt }: TestTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState<string>(OPENAI_API_KEY);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configura il worker di PDF.js usando jsDelivr CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleTest = async () => {
    if (!file) {
      toast({
        title: "Errore",
        description: "Seleziona un file da testare",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Errore",
        description: "Inserisci la tua API Key di OpenAI",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setError(null);

    try {
      // Leggi il contenuto del file
      const fileContent = await readFileContent(file);

      // Inizializza OpenAI client
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Genera lo schema per l'output strutturato
      const outputSchema = generateOutputSchema(outputStructure);

      // Chiamata a OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: aiPrompt
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
      const parsedOutput = JSON.parse(responseContent || "{}");

      // Valida l'output rispetto alla struttura attesa
      const isValid = validateOutput(parsedOutput, outputStructure);

      setResult({
        success: true,
        valid: isValid,
        output: parsedOutput
      });

      toast({
        title: "Test completato",
        description: "L'elaborazione AI è stata eseguita con successo",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Errore durante l'elaborazione";
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'pdf') {
      return await extractTextFromPDF(file);
    } else {
      // File di testo normale
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content);
        };
        reader.onerror = () => reject(new Error("Errore nella lettura del file"));
        reader.readAsText(file);
      });
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Estrai il testo da ogni pagina
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += `\n--- Pagina ${pageNum} ---\n${pageText}\n`;
      }
      
      return fullText;
    } catch (err) {
      throw new Error(`Errore nell'estrazione del testo dal PDF: ${err}`);
    }
  };

  const generateOutputSchema = (fields: any[]): any => {
    const schema: any = {
      type: "object",
      properties: {},
      required: []
    };

    fields.forEach(field => {
      schema.properties[field.name] = {
        type: field.type === "array" ? "array" : field.type,
        description: field.description
      };

      if (field.required) {
        schema.required.push(field.name);
      }

      if (field.type === "array" && field.children) {
        schema.properties[field.name].items = {
          type: "string"
        };
      }
    });

    return schema;
  };

  const validateOutput = (output: any, structure: any[]): boolean => {
    for (const field of structure) {
      if (field.required && !(field.name in output)) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Live Elaborazione AI</CardTitle>
          <CardDescription>
            Carica un file di esempio per testare l'estrazione dei dati
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Carica un documento di testo per verificare che l'AI riesca ad estrarre correttamente i dati secondo la struttura definita.
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
                className="mt-2"
              />
            </div>
          </div>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.md,.json,.pdf"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Clicca per caricare o trascina un file qui"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                File di testo o PDF, max 20MB
              </p>
            </label>
          </div>

          <Button onClick={handleTest} disabled={!file || !apiKey || testing} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            {testing ? "Elaborazione in corso..." : "Esegui Test AI"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {result.valid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-green-600">Test Valido</CardTitle>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-red-600">Non Conforme</CardTitle>
                    </>
                  )}
                </div>
                <CardDescription>Risultato dell'elaborazione AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dati Estratti (Tabellare)</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2 border-b">Campo</th>
                          <th className="text-left p-2 border-b">Valore</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.output).map(([key, value]) => (
                          <tr key={key}>
                            <td className="p-2 border-b font-mono text-sm">{key}</td>
                            <td className="p-2 border-b">
                              {Array.isArray(value) ? value.join(", ") : String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">JSON Completo</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(result.output, null, 2)}
                  </pre>
                </div>

                <Button variant="outline" className="w-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Conferma e Salva Risultato come Valido
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

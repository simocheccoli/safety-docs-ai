import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

interface RiskTestPanelProps {
  contextPrompt: string;
  outputPrompt: string;
}

export const RiskTestPanel = ({ contextPrompt, outputPrompt }: RiskTestPanelProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleTest = async () => {
    if (!file) {
      toast({
        title: "File richiesto",
        description: "Carica un file per testare l'estrazione",
        variant: "destructive",
      });
      return;
    }

    if (!contextPrompt.trim() || !outputPrompt.trim()) {
      toast({
        title: "Prompt richiesti",
        description: "Compila i prompt di contesto e output prima di testare",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setError(null);
    setResult(null);

    try {
      // Simulazione di chiamata AI (mock)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result
      const mockResult = {
        success: true,
        extractedData: {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          extractedFields: [
            { field: "Area", value: "Reparto Produzione" },
            { field: "Livello Rischio", value: "Medio" },
            { field: "Data Valutazione", value: "15/01/2025" },
          ],
          notes: "Dati estratti con successo dal documento. Il prompt di contesto e output sono stati applicati correttamente."
        }
      };

      setResult(mockResult);
      
      toast({
        title: "Test completato",
        description: "L'estrazione dei dati è stata simulata con successo",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il test");
      toast({
        title: "Errore nel test",
        description: "Si è verificato un errore durante il test",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Carica un file di esempio per testare l'estrazione dei dati con i prompt configurati.
          Questa è una simulazione che mostra come funzionerà il sistema una volta integrato con l'AI.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            id="test-file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />
          <label
            htmlFor="test-file"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {file ? (
              <>
                <FileText className="h-12 w-12 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Clicca per caricare un file
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX
                </p>
              </>
            )}
          </label>
        </div>

        <Button
          onClick={handleTest}
          disabled={!file || testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Test in corso...
            </>
          ) : (
            "Avvia Test Estrazione"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <h3 className="font-semibold">Risultato Test</h3>
          
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">File:</span>
                <p className="font-medium">{result.extractedData.fileName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dimensione:</span>
                <p className="font-medium">{result.extractedData.fileSize}</p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">Campi Estratti:</p>
              <div className="space-y-2">
                {result.extractedData.extractedFields.map((field: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm bg-background rounded px-3 py-2">
                    <span className="text-muted-foreground">{field.field}:</span>
                    <span className="font-medium">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2 border-t">
              {result.extractedData.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

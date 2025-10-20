import { useState } from "react";
import { Upload, Play, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

interface TestTabProps {
  riskId?: string;
  inputExpectations: string;
  outputStructure: any[];
}

export function TestTab({ riskId, inputExpectations, outputStructure }: TestTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

    setTesting(true);
    setError(null);

    // Simulazione chiamata API
    setTimeout(() => {
      const mockResult = {
        success: true,
        valid: true,
        output: {
          hazard_description: "Esposizione a 90 dB(A)",
          exposure_level: "alto",
          affected_roles: ["operatore macchina", "manutentore"],
          mitigation_measures: ["tappi auricolari", "schermatura acustica"],
          residual_risk: "medio"
        }
      };

      setResult(mockResult);
      setTesting(false);
      
      toast({
        title: "Test completato",
        description: "L'elaborazione AI è stata eseguita con successo",
      });
    }, 2000);
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
              Carica un documento PDF o DOCX per verificare che l'AI riesca ad estrarre correttamente i dati secondo la struttura definita.
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Clicca per caricare o trascina un file qui"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF o DOCX, max 20MB
              </p>
            </label>
          </div>

          <Button onClick={handleTest} disabled={!file || testing} className="w-full">
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

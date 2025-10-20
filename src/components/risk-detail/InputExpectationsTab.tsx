import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InputExpectationsTabProps {
  value: string;
  onChange: (value: string) => void;
}

export function InputExpectationsTab({ value, onChange }: InputExpectationsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cosa troverà l'AI</CardTitle>
        <CardDescription>
          Descrivi quali informazioni si troveranno all'interno dei documenti relativi a questo rischio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expectations">Aspettative del Contenuto</Label>
          <Textarea
            id="expectations"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Es. L'AI troverà dati di esposizione sonora, ruoli coinvolti, misure preventive, livelli di rischio residuo..."
            rows={12}
            className="font-mono text-sm"
          />
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Suggerimento:</strong> Sii specifico sulle tipologie di dati che l'AI dovrebbe cercare.
            Includi esempi di valori attesi, unità di misura, e formati comuni.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

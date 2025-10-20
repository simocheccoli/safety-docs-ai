import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskStatus } from "@/types/risk";

interface GeneralInfoTabProps {
  name: string;
  description: string;
  status: RiskStatus;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: RiskStatus) => void;
}

export function GeneralInfoTab({
  name,
  description,
  status,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
}: GeneralInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni Generali</CardTitle>
        <CardDescription>
          Definisci il nome, la descrizione e lo stato del rischio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome del Rischio *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Es. Rischio Rumore"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrizione Generale</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Breve descrizione del rischio..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Stato</Label>
          <Select value={status} onValueChange={(value) => onStatusChange(value as RiskStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Bozza</SelectItem>
              <SelectItem value="validated">Validato</SelectItem>
              <SelectItem value="active">Attivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

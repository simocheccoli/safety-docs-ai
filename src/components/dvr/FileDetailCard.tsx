import { useState } from "react";
import { FileText, Download, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileMetadata } from "@/types/dvr";
import { dvrApi } from "@/lib/dvrApi";

interface FileDetailCardProps {
  file: FileMetadata;
  dvrId: string;
  onUpdate: () => void;
}

export function FileDetailCard({ file, dvrId, onUpdate }: FileDetailCardProps) {
  const [notes, setNotes] = useState(file.notes || "");
  const [isIncluded, setIsIncluded] = useState(file.include);

  const handleInclusionChange = async (checked: boolean) => {
    try {
      await dvrApi.updateFile(dvrId, String(file.id), { include: checked });
      setIsIncluded(checked);
      toast({
        title: "Aggiornato",
        description: `File ${checked ? "incluso" : "escluso"} dal DVR`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato di inclusione",
        variant: "destructive",
      });
    }
  };

  const handleNotesChange = async () => {
    try {
      await dvrApi.updateFile(dvrId, String(file.id), { notes });
      toast({
        title: "Note salvate",
        description: "Le note RSPP sono state salvate con successo",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le note",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    const previewUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/dvrs/${dvrId}/files/${file.id}/download`;
    window.open(previewUrl, '_blank');
  };

  const handleDownload = () => {
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/dvrs/${dvrId}/files/${file.id}/download`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header con nome file e rischio */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold">{file.file_name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{file.risk.name}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Anteprima
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </Button>
            </div>
          </div>

          {/* Inclusione nel DVR */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Includi nel DVR</span>
            <Switch
              checked={isIncluded}
              onCheckedChange={handleInclusionChange}
            />
          </div>

          {/* Note RSPP */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note RSPP</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note..."
              rows={3}
            />
            <Button 
              size="sm" 
              onClick={handleNotesChange}
              disabled={notes === (file.notes || "")}
            >
              Salva Note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

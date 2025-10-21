import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadStepProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUploadStep({ onFilesSelected }: FileUploadStepProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caricamento Documenti</CardTitle>
        <CardDescription>
          Seleziona i documenti da analizzare per la creazione del DVR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Puoi caricare più file contemporaneamente. Formati supportati: PDF, DOCX, TXT, MD.
            Dimensione massima per file: 20MB
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.md"
            multiple
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Clicca per caricare o trascina i file qui</p>
            <p className="text-sm text-muted-foreground">
              PDF, DOCX, TXT, MD - Max 20MB per file
            </p>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">File Selezionati ({selectedFiles.length})</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleContinue}
            disabled={selectedFiles.length === 0}
            size="lg"
          >
            Continua alla Classificazione
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

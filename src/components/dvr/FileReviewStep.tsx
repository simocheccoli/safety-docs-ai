import { useState } from "react";
import { FileText, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileWithClassification } from "@/types/dvr";
import { Company } from "@/types/company";

interface FileReviewStepProps {
  dvrName: string;
  company?: Company;
  files: FileWithClassification[];
  onConfirm: () => void;
  onBack: () => void;
  isCreating: boolean;
}

export function FileReviewStep({ 
  dvrName, 
  company, 
  files, 
  onConfirm, 
  onBack,
  isCreating 
}: FileReviewStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisione e Conferma</CardTitle>
        <CardDescription>
          Verifica i dati del DVR prima di procedere alla creazione
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informazioni DVR */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Informazioni DVR</h3>
            <div className="p-4 border rounded-lg space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Nome:</span>
                <p className="font-medium">{dvrName}</p>
              </div>
              
              {company && (
                <div>
                  <span className="text-sm text-muted-foreground">Azienda:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <p className="font-medium">{company.name}</p>
                  </div>
                  {company.address && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {company.address}, {company.city}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Lista File */}
          <div>
            <h3 className="font-semibold mb-2">
              Documenti Inclusi ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  {item.metadata.include && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Incluso
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Riepilogo */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Riepilogo</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totale documenti:</span>
              <span className="font-medium">{files.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Documenti inclusi:</span>
              <span className="font-medium">
                {files.filter(f => f.metadata.include).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stato iniziale:</span>
              <Badge variant="outline">BOZZA</Badge>
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={isCreating}
          >
            Indietro
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isCreating}
            size="lg"
          >
            {isCreating ? (
              <>
                <span className="mr-2">Creazione in corso...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              'Crea DVR'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Tag, Cpu, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadStep } from "@/components/dvr/FileUploadStep";
import { FileClassificationStep } from "@/components/dvr/FileClassificationStep";
import { FileProcessingStep } from "@/components/dvr/FileProcessingStep";
import { FileReviewStep } from "@/components/dvr/FileReviewStep";
import { FileWithClassification } from "@/types/dvr";

type WizardStep = 'upload' | 'classify' | 'process' | 'review';

export default function DVRWizard() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const existingDvrId = searchParams.get('dvrId');
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [files, setFiles] = useState<FileWithClassification[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [dvrId, setDvrId] = useState<string>(existingDvrId || "");
  const [dvrName, setDvrName] = useState<string>("");
  const [companyId, setCompanyId] = useState<number | undefined>();

  const steps = [
    { id: 'upload', label: 'Caricamento', icon: Upload },
    { id: 'classify', label: 'Classificazione', icon: Tag },
    { id: 'process', label: 'Elaborazione AI', icon: Cpu },
    { id: 'review', label: 'Revisione', icon: FileCheck },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleFilesSelected = (selectedFiles: File[], name: string, companyId?: number) => {
    setDvrName(name);
    setCompanyId(companyId);
    const newFiles: FileWithClassification[] = selectedFiles.map(file => ({
      file,
      metadata: {
        file_id: crypto.randomUUID(),
        nome_file: file.name,
        file_size: file.size,
        file_type: file.type,
        inclusione_dvr: true,
        note_rspp: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }));
    setFiles(newFiles);
    setCurrentStep('classify');
  };

  const handleClassificationComplete = (classifiedFiles: FileWithClassification[]) => {
    setFiles(classifiedFiles);
    setCurrentStep('process');
  };

  const handleProcessingComplete = (processedFiles: FileWithClassification[]) => {
    setFiles(processedFiles);
    setCurrentStep('review');
  };

  const handleReviewComplete = (createdDvrId: string) => {
    navigate(`/dvr/${createdDvrId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Creazione DVR</h1>
          <p className="text-muted-foreground">Wizard guidato per l'importazione e analisi documenti</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    index <= currentStepIndex ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-12 mx-4 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {currentStep === 'upload' && (
        <FileUploadStep onFilesSelected={handleFilesSelected} />
      )}

      {currentStep === 'classify' && (
        <FileClassificationStep 
          files={files} 
          onComplete={handleClassificationComplete}
          onBack={() => setCurrentStep('upload')}
        />
      )}

      {currentStep === 'process' && (
        <FileProcessingStep 
          files={files}
          apiKey={apiKey}
          setApiKey={setApiKey}
          onComplete={handleProcessingComplete}
          onBack={() => setCurrentStep('classify')}
        />
      )}

      {currentStep === 'review' && (
        <FileReviewStep 
          files={files}
          dvrName={dvrName}
          companyId={companyId}
          existingDvrId={existingDvrId || undefined}
          onComplete={handleReviewComplete}
          onBack={() => setCurrentStep('process')}
        />
      )}
    </div>
  );
}

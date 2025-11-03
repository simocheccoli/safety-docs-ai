import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadStep } from "@/components/dvr/FileUploadStep";
import { FileClassificationStep } from "@/components/dvr/FileClassificationStep";
import { FileProcessingStep } from "@/components/dvr/FileProcessingStep";
import { FileReviewStep } from "@/components/dvr/FileReviewStep";
import { dvrApi } from "@/lib/dvrApi";
import { companyApi } from "@/lib/companyApi";
import { toast } from "@/hooks/use-toast";
import { FileWithClassification } from "@/types/dvr";
import { Company } from "@/types/company";

type WizardStep = 'upload' | 'classification' | 'processing' | 'review';

export default function DVRWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dvrName, setDvrName] = useState('');
  const [companyId, setCompanyId] = useState<number | undefined>();
  const [company, setCompany] = useState<Company | undefined>();
  const [classifiedFiles, setClassifiedFiles] = useState<FileWithClassification[]>([]);
  const [createdDvrId, setCreatedDvrId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (companyId) {
      companyApi.getById(companyId).then(setCompany).catch(console.error);
    }
  }, [companyId]);

  const handleFilesSelected = (files: File[], name: string, selectedCompanyId?: number) => {
    setSelectedFiles(files);
    setDvrName(name);
    setCompanyId(selectedCompanyId);
    setCurrentStep('classification');
  };

  const handleFilesClassified = (files: FileWithClassification[]) => {
    setClassifiedFiles(files);
    setCurrentStep('processing');
  };

  const handleProcessingComplete = () => {
    setCurrentStep('review');
  };

  const handleCreateDVR = async () => {
    try {
      setIsCreating(true);
      
      // Crea il mapping nome_file -> risk_id
      const fileRiskMappings: Record<string, number> = {};
      classifiedFiles.forEach(cf => {
        if (cf.metadata.risk_id) {
          fileRiskMappings[cf.file.name] = cf.metadata.risk_id;
        }
      });
      
      const newDVR = await dvrApi.createDVR(
        dvrName,
        classifiedFiles.map(f => f.file),
        companyId,
        undefined, // description
        fileRiskMappings
      );
      
      toast({
        title: "DVR Creato",
        description: `Il DVR "${newDVR.nome}" è stato creato con successo`,
      });
      
      navigate(`/dvr/${newDVR.id}`);
    } catch (error) {
      console.error("Errore nella creazione del DVR:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il DVR. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUploadStep 
            onFilesSelected={handleFilesSelected}
          />
        );
      
      case 'classification':
        return (
          <FileClassificationStep
            files={selectedFiles}
            onClassified={handleFilesClassified}
            onBack={() => setCurrentStep('upload')}
          />
        );
      
      case 'processing':
        return (
          <FileProcessingStep
            files={classifiedFiles}
            dvrId={createdDvrId}
            onComplete={handleProcessingComplete}
            onBack={() => setCurrentStep('classification')}
          />
        );
      
      case 'review':
        return (
          <FileReviewStep
            dvrName={dvrName}
            company={company}
            files={classifiedFiles}
            onConfirm={handleCreateDVR}
            onBack={() => setCurrentStep('processing')}
            isCreating={isCreating}
          />
        );
    }
  };

  const getStepNumber = () => {
    const steps: WizardStep[] = ['upload', 'classification', 'processing', 'review'];
    return steps.indexOf(currentStep) + 1;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dvr')}
          disabled={isCreating}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Nuovo DVR</h1>
          <p className="text-muted-foreground">
            Step {getStepNumber()} di 4: {
              currentStep === 'upload' ? 'Caricamento Documenti' :
              currentStep === 'classification' ? 'Classificazione' :
              currentStep === 'processing' ? 'Elaborazione' :
              'Revisione'
            }
          </p>
        </div>
      </div>

      {renderStep()}
    </div>
  );
}

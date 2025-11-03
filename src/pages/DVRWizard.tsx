import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadStep } from "@/components/dvr/FileUploadStep";
import { dvrApi } from "@/lib/dvrApi";
import { toast } from "@/hooks/use-toast";

export default function DVRWizard() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleFilesSelected = async (files: File[], dvrName: string, companyId?: number) => {
    try {
      setIsCreating(true);
      
      // Crea il DVR con i file selezionati
      const newDVR = await dvrApi.createDVR(dvrName, files, companyId);
      
      toast({
        title: "DVR Creato",
        description: `Il DVR "${newDVR.nome}" è stato creato con successo`,
      });
      
      // Naviga al DVR appena creato
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
        <div>
          <h1 className="text-3xl font-bold">Nuovo DVR</h1>
          <p className="text-muted-foreground">
            Carica i documenti per creare un nuovo Documento di Valutazione dei Rischi
          </p>
        </div>
      </div>

      <FileUploadStep 
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
}

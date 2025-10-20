import { useState, useEffect } from "react";
import { Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { RiskType } from "@/types/risk";
import { getRiskTypes, deleteRiskType, saveRiskType } from "@/lib/riskStorage";

interface RiskTypeListProps {
  onEdit: (risk: RiskType) => void;
}

export const RiskTypeList = ({ onEdit }: RiskTypeListProps) => {
  const [risks, setRisks] = useState<RiskType[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRisks = () => {
    setRisks(getRiskTypes());
  };

  useEffect(() => {
    loadRisks();
    
    // Listen for storage changes
    const handleStorageChange = () => loadRisks();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('riskTypesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('riskTypesUpdated', handleStorageChange);
    };
  }, []);

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteRiskType(deleteId);
    window.dispatchEvent(new Event('riskTypesUpdated'));
    setDeleteId(null);
    
    toast({
      title: "Rischio eliminato",
      description: "Il tipo di rischio è stato eliminato con successo",
    });
  };

  const handleToggleEnabled = (risk: RiskType) => {
    const updated = { ...risk, enabled: !risk.enabled };
    saveRiskType(updated);
    window.dispatchEvent(new Event('riskTypesUpdated'));
    
    toast({
      title: updated.enabled ? "Rischio abilitato" : "Rischio disabilitato",
      description: `Il rischio "${risk.title}" è stato ${updated.enabled ? 'abilitato' : 'disabilitato'}`,
    });
  };

  if (risks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          Nessun tipo di rischio configurato. Crea il primo rischio per iniziare.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {risks.map((risk) => (
          <Card key={risk.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{risk.title}</h3>
                  <Badge variant={risk.enabled ? "default" : "secondary"}>
                    {risk.enabled ? "Abilitato" : "Disabilitato"}
                  </Badge>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Prompt di contesto:
                    </p>
                    <p className="text-sm line-clamp-2">{risk.contextPrompt}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Prompt di output:
                    </p>
                    <p className="text-sm line-clamp-2">{risk.outputPrompt}</p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Creato: {new Date(risk.createdAt).toLocaleDateString('it-IT')}
                  {risk.updatedAt !== risk.createdAt && 
                    ` · Modificato: ${new Date(risk.updatedAt).toLocaleDateString('it-IT')}`
                  }
                </p>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleToggleEnabled(risk)}
                  title={risk.enabled ? "Disabilita" : "Abilita"}
                >
                  {risk.enabled ? (
                    <Power className="h-4 w-4 text-green-600" />
                  ) : (
                    <PowerOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(risk)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteId(risk.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo tipo di rischio? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskTypeList } from "@/components/RiskTypeList";
import { RiskTypeDialog } from "@/components/RiskTypeDialog";
import { RiskType } from "@/types/risk";

const RiskManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskType | undefined>();

  const handleCreate = () => {
    setEditingRisk(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (risk: RiskType) => {
    setEditingRisk(risk);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingRisk(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Rischi</h1>
          <p className="text-muted-foreground mt-2">
            Configura i 48 tipi di rischio con AI per l'estrazione automatica dei dati
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Rischio
        </Button>
      </div>

      <RiskTypeList onEdit={handleEdit} />

      <RiskTypeDialog
        open={isDialogOpen}
        onClose={handleClose}
        editingRisk={editingRisk}
      />
    </div>
  );
};

export default RiskManagement;

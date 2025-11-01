import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskTable } from "@/components/RiskTable";
import { RiskType, RiskStatus } from "@/types/risk";
import { getRiskTypes } from "@/lib/riskApi";
import { useToast } from "@/hooks/use-toast";

const RiskManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [risks, setRisks] = useState<RiskType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RiskStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRisks();
    
    const handleUpdate = () => loadRisks();
    window.addEventListener('riskTypesUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('riskTypesUpdated', handleUpdate);
    };
  }, []);

  const loadRisks = async () => {
    try {
      setIsLoading(true);
      const data = await getRiskTypes();
      setRisks(data);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i rischi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/rischi/new");
  };

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Rischi AI</h1>
          <p className="text-muted-foreground mt-2">
            Configura i rischi con AI per l'estrazione automatica dei dati
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Rischio
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cerca per nome o descrizione..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RiskStatus | "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="draft">Bozza</SelectItem>
            <SelectItem value="validated">Validato</SelectItem>
            <SelectItem value="active">Attivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <RiskTable risks={filteredRisks} onRefresh={loadRisks} />
    </div>
  );
};

export default RiskManagement;

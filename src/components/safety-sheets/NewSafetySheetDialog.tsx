import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createElaboration } from "@/lib/elaborationApi";
import { companyApi } from "@/lib/companyApi";
import { Company } from "@/types/company";

interface NewSafetySheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewSafetySheetDialog({ open, onOpenChange, onSuccess }: NewSafetySheetDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [companyBranchId, setCompanyBranchId] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCompanies();
    }
  }, [open]);

  useEffect(() => {
    if (companyId) {
      const company = companies.find(c => c.id.toString() === companyId);
      setSelectedCompany(company || null);
      // Auto-select main branch if available
      if (company?.branches && company.branches.length > 0) {
        const mainBranch = company.branches.find(b => b.is_main);
        if (mainBranch && mainBranch.id) {
          setCompanyBranchId(mainBranch.id.toString());
        } else {
          setCompanyBranchId("");
        }
      } else {
        setCompanyBranchId("");
      }
    } else {
      setSelectedCompany(null);
      setCompanyBranchId("");
    }
  }, [companyId, companies]);

  const loadCompanies = async () => {
    try {
      const result = await companyApi.getAll();
      setCompanies(result);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per la scheda di sicurezza",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedCompany = companies.find(c => c.id.toString() === companyId);
      await createElaboration(
        title.trim(),
        description.trim(),
        selectedCompany ? selectedCompany.id : null,
        selectedCompany ? selectedCompany.name : null,
        companyBranchId ? parseInt(companyBranchId) : null
      );

      toast({
        title: "Scheda creata",
        description: "La scheda di sicurezza è stata creata. Ora puoi aggiungere i caricamenti.",
      });

      setTitle("");
      setDescription("");
      setCompanyId("");
      setCompanyBranchId("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare la scheda di sicurezza",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCompanyId("");
    setCompanyBranchId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuova Scheda di Sicurezza</DialogTitle>
          <DialogDescription>
            Crea una nuova scheda di sicurezza. Potrai aggiungere i caricamenti con mansione, reparto e area successivamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Nome Scheda *</Label>
            <Input
              id="title"
              placeholder="Es. Scheda Sicurezza Stabilimento Nord"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              placeholder="Descrizione opzionale della scheda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Azienda</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un'azienda (opzionale)" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && selectedCompany.branches && selectedCompany.branches.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="branch">Stabilimento</Label>
              <Select value={companyBranchId || undefined} onValueChange={(value) => setCompanyBranchId(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona uno stabilimento (opzionale)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuno stabilimento</SelectItem>
                  {selectedCompany.branches
                    .filter((branch) => branch.id != null)
                    .map((branch) => (
                      <SelectItem key={branch.id} value={branch.id!.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{branch.name}</span>
                          {branch.is_main && <span className="text-xs text-muted-foreground">(Principale)</span>}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creazione..." : "Crea Scheda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

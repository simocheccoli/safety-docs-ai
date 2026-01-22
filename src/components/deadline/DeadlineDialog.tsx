import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Deadline, CreateDeadlineData, NextValidationInterval, INTERVAL_LABELS } from "@/types/deadline";
import { Company } from "@/types/company";
import { RiskType } from "@/types/risk";
import { Plus, Building2, ShieldAlert } from "lucide-react";

interface DeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: Company[];
  riskTypes: RiskType[];
  onSave: (data: CreateDeadlineData, companyName?: string, riskTypeName?: string) => Promise<void>;
  onQuickCreateCompany: () => void;
}

export function DeadlineDialog({ 
  open, 
  onOpenChange, 
  companies, 
  riskTypes,
  onSave,
  onQuickCreateCompany 
}: DeadlineDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [companyBranchId, setCompanyBranchId] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [riskTypeId, setRiskTypeId] = useState<string>("");
  const [lastValidationDate, setLastValidationDate] = useState<Date | undefined>();
  const [nextValidationDate, setNextValidationDate] = useState<Date | undefined>();
  const [nextValidationInterval, setNextValidationInterval] = useState<NextValidationInterval>("12");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form quando si apre (solo creazione)
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setNote("");
      setCompanyId("");
      setCompanyBranchId("");
      setRiskTypeId("");
      setLastValidationDate(undefined);
      setNextValidationDate(undefined);
      setNextValidationInterval("12");
    }
  }, [open]);

  useEffect(() => {
    if (companyId) {
      const company = companies.find(c => c.id.toString() === companyId);
      setSelectedCompany(company || null);
      
      if (company?.branches && company.branches.length > 0) {
        // Se c'è già un branch selezionato e appartiene a questa azienda, mantenerlo
        // Ignora "none" come valore valido
        if (companyBranchId && companyBranchId !== "none") {
          const currentBranch = company.branches.find(b => b.id?.toString() === companyBranchId);
          if (currentBranch) {
            // Mantieni la selezione esistente
            return;
          }
        }
        
        // Se l'azienda ha esattamente 1 stabilimento, selezionalo automaticamente
        if (company.branches.length === 1) {
          const branchId = company.branches[0].id?.toString() || "";
          setCompanyBranchId(branchId);
        } 
        // Se ha più stabilimenti, seleziona quello principale
        else {
          const mainBranch = company.branches.find(b => b.is_main);
          if (mainBranch?.id) {
            setCompanyBranchId(mainBranch.id.toString());
          } else {
            // Nessun branch principale, lascia vuoto
            setCompanyBranchId("");
          }
        }
      } else {
        setCompanyBranchId("");
      }
    } else {
      setSelectedCompany(null);
      setCompanyBranchId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, companies]);

  const handleSave = async () => {
    if (!title.trim() || !companyId) return;
    
    setIsSaving(true);
    try {
      const selectedCompany = companies.find(c => c.id.toString() === companyId);
      const selectedRiskType = riskTypes.find(r => r.id === riskTypeId);
      
      // Calcola next_validation_date se necessario
      let calculatedNextDate: string | undefined;
      if (lastValidationDate && nextValidationInterval) {
        if (nextValidationInterval === 'custom') {
          calculatedNextDate = nextValidationDate?.toISOString().split('T')[0];
        } else if (nextValidationInterval !== 'on_request') {
          // Calcola per intervalli numerici (12, 24, 36, 48)
          const months = parseInt(nextValidationInterval);
          if (!isNaN(months)) {
            const nextDate = new Date(lastValidationDate);
            nextDate.setMonth(nextDate.getMonth() + months);
            calculatedNextDate = nextDate.toISOString().split('T')[0];
          }
        }
      }
      
      const data: CreateDeadlineData = {
        title: title.trim(),
        description: description.trim() || undefined,
        note: note.trim() || undefined,
        company_id: parseInt(companyId),
        company_branch_id: companyBranchId ? parseInt(companyBranchId) : undefined,
        risk_type_id: riskTypeId || undefined,
        last_validation_date: lastValidationDate?.toISOString().split('T')[0],
        next_validation_date: calculatedNextDate,
        next_validation_interval: nextValidationInterval,
      };
      await onSave(data, selectedCompany?.name, selectedRiskType?.name);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const showCustomDatePicker = nextValidationInterval === 'custom';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Pianifica Valutazione
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es: Revisione DVR annuale"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione dell'attività"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Azienda *</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={onQuickCreateCompany}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nuova azienda
              </Button>
            </div>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona azienda">
                  {companyId && (
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {companies.find(c => c.id.toString() === companyId)?.name}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {company.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo di Rischio</Label>
            <Select value={riskTypeId || "none"} onValueChange={(value) => setRiskTypeId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo di rischio">
                  {riskTypeId && (
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                      {riskTypes.find(r => r.id === riskTypeId)?.name}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Nessuno</span>
                </SelectItem>
                {riskTypes.map((riskType) => (
                  <SelectItem key={riskType.id} value={riskType.id}>
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                      {riskType.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && selectedCompany.branches && selectedCompany.branches.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="branch">Stabilimento</Label>
              <Select value={companyBranchId || "none"} onValueChange={(value) => setCompanyBranchId(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona uno stabilimento (opzionale)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuno stabilimento</SelectItem>
                  {selectedCompany.branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id?.toString() || "none"}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data ultima valutazione</Label>
              <DatePicker
                date={lastValidationDate}
                onSelect={setLastValidationDate}
                placeholder="Seleziona data"
              />
            </div>

            <div className="space-y-2">
              <Label>Intervallo prossima valutazione *</Label>
              <Select 
                value={nextValidationInterval} 
                onValueChange={(value) => {
                  setNextValidationInterval(value as NextValidationInterval);
                  // Auto-calculate next validation date if interval is selected
                  if (value !== 'custom' && value !== 'on_request' && lastValidationDate) {
                    const months = parseInt(value);
                    const nextDate = new Date(lastValidationDate);
                    nextDate.setMonth(nextDate.getMonth() + months);
                    setNextValidationDate(nextDate);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INTERVAL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showCustomDatePicker && (
            <div className="space-y-2">
              <Label>Data prossima valutazione</Label>
              <DatePicker
                date={nextValidationDate}
                onSelect={setNextValidationDate}
                placeholder="Seleziona data personalizzata"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={2}
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title.trim() || !companyId || isSaving}
          >
            {isSaving ? "Salvataggio..." : "Crea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Deadline, CreateDeadlineData, NextVisitInterval, INTERVAL_LABELS } from "@/types/deadline";
import { Company } from "@/types/company";
import { RiskType } from "@/types/risk";
import { Plus, Building2, Shield } from "lucide-react";

interface DeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deadline?: Deadline;
  companies: Company[];
  risks: RiskType[];
  onSave: (data: CreateDeadlineData, companyName?: string, riskName?: string) => Promise<void>;
  onQuickCreateCompany: () => void;
}

export function DeadlineDialog({ 
  open, 
  onOpenChange, 
  deadline, 
  companies,
  risks,
  onSave,
  onQuickCreateCompany 
}: DeadlineDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [riskId, setRiskId] = useState<string>("");
  const [lastVisitDate, setLastVisitDate] = useState<Date | undefined>();
  const [nextVisitDate, setNextVisitDate] = useState<Date | undefined>();
  const [nextVisitInterval, setNextVisitInterval] = useState<NextVisitInterval>("12");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (deadline) {
        setTitle(deadline.title);
        setDescription(deadline.description || "");
        setNote(deadline.note || "");
        setCompanyId(deadline.company_id.toString());
        setRiskId(deadline.risk_id || "");
        setLastVisitDate(deadline.last_visit_date ? new Date(deadline.last_visit_date) : undefined);
        setNextVisitDate(deadline.next_visit_date ? new Date(deadline.next_visit_date) : undefined);
        setNextVisitInterval(deadline.next_visit_interval);
      } else {
        setTitle("");
        setDescription("");
        setNote("");
        setCompanyId("");
        setRiskId("");
        setLastVisitDate(undefined);
        setNextVisitDate(undefined);
        setNextVisitInterval("12");
      }
    }
  }, [open, deadline]);

  const handleSave = async () => {
    if (!title.trim() || !companyId) return;
    
    setIsSaving(true);
    try {
      const selectedCompany = companies.find(c => c.id.toString() === companyId);
      const selectedRisk = risks.find(r => r.id === riskId);
      const data: CreateDeadlineData = {
        title: title.trim(),
        description: description.trim() || undefined,
        note: note.trim() || undefined,
        company_id: parseInt(companyId),
        risk_id: riskId || undefined,
        last_visit_date: lastVisitDate?.toISOString().split('T')[0],
        next_visit_date: nextVisitInterval === 'custom' ? nextVisitDate?.toISOString().split('T')[0] : undefined,
        next_visit_interval: nextVisitInterval,
      };
      await onSave(data, selectedCompany?.name, selectedRisk?.name);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const showCustomDatePicker = nextVisitInterval === 'custom';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {deadline ? "Modifica Scadenza" : "Nuova Scadenza"}
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
            <Label>Rischio specifico</Label>
            <Select value={riskId} onValueChange={setRiskId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona rischio (opzionale)">
                  {riskId && (
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {risks.find(r => r.id === riskId)?.name}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nessun rischio specifico</SelectItem>
                {risks.map((risk) => (
                  <SelectItem key={risk.id} value={risk.id}>
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {risk.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data ultima visita</Label>
              <DatePicker
                date={lastVisitDate}
                onSelect={setLastVisitDate}
                placeholder="Seleziona data"
              />
            </div>

            <div className="space-y-2">
              <Label>Intervallo prossima visita *</Label>
              <Select 
                value={nextVisitInterval} 
                onValueChange={(value) => setNextVisitInterval(value as NextVisitInterval)}
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
              <Label>Data prossima visita</Label>
              <DatePicker
                date={nextVisitDate}
                onSelect={setNextVisitDate}
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
            {isSaving ? "Salvataggio..." : deadline ? "Aggiorna" : "Crea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

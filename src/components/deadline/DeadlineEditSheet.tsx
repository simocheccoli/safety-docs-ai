import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Deadline, CreateDeadlineData, NextValidationInterval, INTERVAL_LABELS } from "@/types/deadline";
import { Company } from "@/types/company";
import { RiskType } from "@/types/risk";
import { Plus, Building2, ShieldAlert, History, Calendar, FileText } from "lucide-react";
import { ValidationHistory } from "./ValidationHistory";
import { useQuery } from "@tanstack/react-query";
import { deadlineApi } from "@/lib/deadlineApi";

interface DeadlineEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deadline: Deadline;
  companies: Company[];
  riskTypes: RiskType[];
  onSave: (id: number, data: CreateDeadlineData, companyName?: string, riskTypeName?: string) => Promise<void>;
  onQuickCreateCompany: () => void;
}

export function DeadlineEditSheet({ 
  open, 
  onOpenChange, 
  deadline, 
  companies, 
  riskTypes,
  onSave,
  onQuickCreateCompany 
}: DeadlineEditSheetProps) {
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

  // Carica validazioni
  const { data: validations = [] } = useQuery({
    queryKey: ['deadline-validations', deadline.id],
    queryFn: () => deadlineApi.getValidations(deadline.id),
    enabled: open,
  });

  // Carica dati quando si apre
  useEffect(() => {
    if (open && deadline) {
      setTitle(deadline.title);
      setDescription(deadline.description || "");
      setNote(deadline.note || "");
      setCompanyId(deadline.company_id.toString());
      setCompanyBranchId(deadline.company_branch_id?.toString() || "");
      setRiskTypeId(deadline.risk_type_id ? String(deadline.risk_type_id) : "");
      setLastValidationDate(deadline.last_validation_date ? new Date(deadline.last_validation_date) : undefined);
      setNextValidationDate(deadline.next_validation_date ? new Date(deadline.next_validation_date) : undefined);
      setNextValidationInterval(deadline.next_validation_interval);
    }
  }, [open, deadline]);

  // Gestione selezione azienda e stabilimento
  useEffect(() => {
    if (companyId) {
      const company = companies.find(c => c.id.toString() === companyId);
      setSelectedCompany(company || null);
      
      if (company?.branches && company.branches.length > 0) {
        if (companyBranchId && companyBranchId !== "none") {
          const currentBranch = company.branches.find(b => b.id?.toString() === companyBranchId);
          if (currentBranch) {
            return;
          }
        }
        
        if (company.branches.length === 1) {
          setCompanyBranchId(company.branches[0].id?.toString() || "");
        } else {
          const mainBranch = company.branches.find(b => b.is_main);
          if (mainBranch?.id) {
            setCompanyBranchId(mainBranch.id.toString());
          } else {
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
      await onSave(deadline.id, data, selectedCompany?.name, selectedRiskType?.name);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const showCustomDatePicker = nextValidationInterval === 'custom';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Modifica Scadenza: {deadline.title}
          </SheetTitle>
          <SheetDescription>
            Aggiorna i dati della scadenza e visualizza lo storico delle valutazioni
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col h-[calc(100vh-8rem)]">
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4 py-4">
              {/* Card Informazioni Generali */}
              <Card className="shadow-none">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-semibold">Informazioni Generali</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-sm">Titolo *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Es: Revisione DVR annuale"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-sm">Descrizione</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrizione dell'attività"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="note" className="text-sm">Note</Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note aggiuntive..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card Azienda */}
              <Card className="shadow-none">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    Azienda
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Azienda *</Label>
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
                      <SelectTrigger className="h-8 text-sm">
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

                  {selectedCompany && selectedCompany.branches && selectedCompany.branches.length > 0 && (
                    <div className="space-y-1.5">
                      <Label htmlFor="branch" className="text-sm">Stabilimento</Label>
                      <Select value={companyBranchId || "none"} onValueChange={(value) => setCompanyBranchId(value === "none" ? "" : value)}>
                        <SelectTrigger className="h-8 text-sm">
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

                  <div className="space-y-1.5">
                    <Label className="text-sm">Tipo di Rischio</Label>
                    <Select value={riskTypeId || "none"} onValueChange={(value) => setRiskTypeId(value === "none" ? "" : value)}>
                      <SelectTrigger className="h-8 text-sm">
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
                </CardContent>
              </Card>

              {/* Card Date */}
              <Card className="shadow-none">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Data ultima valutazione</Label>
                      <DatePicker
                        date={lastValidationDate}
                        onSelect={setLastValidationDate}
                        placeholder="Seleziona data"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Intervallo prossima valutazione *</Label>
                      <Select 
                        value={nextValidationInterval} 
                        onValueChange={(value) => {
                          setNextValidationInterval(value as NextValidationInterval);
                          if (value !== 'custom' && value !== 'on_request' && lastValidationDate) {
                            const months = parseInt(value);
                            const nextDate = new Date(lastValidationDate);
                            nextDate.setMonth(nextDate.getMonth() + months);
                            setNextValidationDate(nextDate);
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm">
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
                    <div className="space-y-1.5">
                      <Label className="text-sm">Data prossima valutazione</Label>
                      <DatePicker
                        date={nextValidationDate}
                        onSelect={setNextValidationDate}
                        placeholder="Seleziona data personalizzata"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card Storico Valutazioni */}
              <Card className="shadow-none">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="h-3.5 w-3.5" />
                    Storico Valutazioni
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ValidationHistory validations={validations} />
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Footer Sticky */}
          <div className="sticky bottom-0 bg-background border-t pt-4 pb-2 mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={!title.trim() || !companyId || isSaving}
            >
              {isSaving ? "Salvataggio..." : "Aggiorna"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

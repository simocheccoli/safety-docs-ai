import { useState, useEffect } from "react";
import { Building2, MapPin, Mail, Phone, User, FileText, Stethoscope, Users, Briefcase, LayoutGrid, UserCog } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { companyApi } from "@/lib/companyApi";
import { Company, CreateCompanyData, CompanyBranch, mapCompanyToBackend } from "@/types/company";
import { TagListEditor } from "@/components/company/TagListEditor";
import { BranchListEditor } from "@/components/company/BranchListEditor";

interface CompanyEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: number;
  company?: Company;
  onSuccess?: () => void;
}

export function CompanyEditSheet({ 
  open, 
  onOpenChange, 
  companyId, 
  company: initialCompany,
  onSuccess 
}: CompanyEditSheetProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(initialCompany || null);
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    vat_number: '',
    tax_code: '',
    address: '',
    zip: '',
    city: '',
    province: '',
    country: '',
    email: '',
    phone: '',
    pec: '',
      legal_representative: '',
      rspp: '',
      rls: '',
      doctor: '',
      mansioni: [],
      reparti: [],
      aree: [],
      branches: [],
    });

  useEffect(() => {
    if (open) {
      if (initialCompany) {
        setCompany(initialCompany);
        loadFormData(initialCompany);
      } else if (companyId) {
        loadCompany();
      } else {
        resetForm();
      }
    }
  }, [open, companyId, initialCompany]);

  const loadCompany = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const data = await companyApi.getById(companyId);
      setCompany(data);
      loadFormData(data);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati dell'azienda",
        variant: "destructive",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = (companyData: Company) => {
    setFormData({
      name: companyData.name,
      // Use camelCase from API with fallback to legacy snake_case
      vat: companyData.vat || companyData.vat_number || '',
      vat_number: companyData.vat || companyData.vat_number || '',
      fiscalCode: companyData.fiscalCode || companyData.tax_code || '',
      tax_code: companyData.fiscalCode || companyData.tax_code || '',
      address: companyData.address || '',
      // Use 'cap' from API with fallback to 'zip'
      cap: companyData.cap || companyData.zip || '',
      zip: companyData.cap || companyData.zip || '',
      city: companyData.city || '',
      province: companyData.province || '',
      country: companyData.country || '',
      email: companyData.email || '',
      phone: companyData.phone || '',
      pec: companyData.pec || '',
      // Use camelCase from API with fallback to legacy snake_case
      legalRepresentative: companyData.legalRepresentative || companyData.legal_representative || '',
      legal_representative: companyData.legalRepresentative || companyData.legal_representative || '',
      rspp: companyData.rspp || '',
      rls: companyData.rls || '',
      // Use 'medico' from API with fallback to 'doctor'
      medico: companyData.medico || companyData.doctor || '',
      doctor: companyData.medico || companyData.doctor || '',
      mansioni: companyData.mansioni || [],
      reparti: companyData.reparti || [],
      aree: companyData.aree || [],
      branches: companyData.branches || [],
    });
  };

  const resetForm = () => {
    setCompany(null);
    setFormData({
      name: '',
      vat_number: '',
      tax_code: '',
      address: '',
      zip: '',
      city: '',
      province: '',
      country: '',
      email: '',
      phone: '',
      pec: '',
      legal_representative: '',
      rspp: '',
      rls: '',
      doctor: '',
      mansioni: [],
      reparti: [],
      aree: [],
      branches: [],
    });
  };

  const handleChange = (field: keyof CreateCompanyData, value: string | string[] | CompanyBranch[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome dell'azienda è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const mappedData = mapCompanyToBackend(formData);
      if (company) {
        await companyApi.update(company.id, mappedData);
        toast({
          title: "Successo",
          description: "Azienda aggiornata con successo",
        });
      } else {
        await companyApi.create(mappedData);
        toast({
          title: "Successo",
          description: "Azienda creata con successo",
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Errore",
        description: company ? "Impossibile aggiornare l'azienda" : "Impossibile creare l'azienda",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-5xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company ? "Modifica Azienda" : "Nuova Azienda"}
          </SheetTitle>
          <SheetDescription>
            {company ? "Aggiorna i dati dell'azienda" : "Inserisci i dati della nuova azienda"}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Caricamento...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-8rem)]">
            <ScrollArea className="flex-1 pr-2">
              <Tabs defaultValue="informazioni" className="w-full py-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="informazioni">Informazioni Azienda</TabsTrigger>
                  <TabsTrigger value="organizzazione">Organizzazione</TabsTrigger>
                </TabsList>

                {/* Tab 1 - Informazioni Azienda */}
                <TabsContent value="informazioni" className="space-y-2 mt-3">
                  {/* Card Informazioni Generali */}
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Informazioni Generali
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1.5">
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-sm">Nome Azienda *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Es. Acme S.r.l."
                          required
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="vat_number" className="text-sm">Partita IVA</Label>
                          <Input
                            id="vat_number"
                            value={formData.vat_number}
                            onChange={(e) => handleChange('vat_number', e.target.value)}
                            placeholder="IT12345678901"
                            maxLength={20}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="tax_code" className="text-sm">Codice Fiscale</Label>
                          <Input
                            id="tax_code"
                            value={formData.tax_code}
                            onChange={(e) => handleChange('tax_code', e.target.value)}
                            placeholder="12345678901"
                            maxLength={20}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Indirizzo */}
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        Indirizzo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1.5">
                      <div className="space-y-1">
                        <Label htmlFor="address" className="text-sm">Via/Piazza</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          placeholder="Via Roma, 1"
                          maxLength={255}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="zip" className="text-sm">CAP</Label>
                          <Input
                            id="zip"
                            value={formData.zip}
                            onChange={(e) => handleChange('zip', e.target.value)}
                            placeholder="00100"
                            maxLength={10}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="city" className="text-sm">Città</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            placeholder="Roma"
                            maxLength={100}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="province" className="text-sm">Provincia</Label>
                          <Input
                            id="province"
                            value={formData.province}
                            onChange={(e) => handleChange('province', e.target.value)}
                            placeholder="RM"
                            maxLength={5}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="country" className="text-sm">Paese</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleChange('country', e.target.value)}
                          placeholder="Italia"
                          maxLength={100}
                          className="h-8 text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Stabilimenti */}
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Stabilimenti
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <Label className="text-sm text-muted-foreground">
                        Gestisci gli stabilimenti dell'azienda. Puoi impostare uno stabilimento principale che verrà selezionato automaticamente.
                      </Label>
                      <div className="mt-2">
                        <BranchListEditor
                          values={formData.branches || []}
                          onChange={(values) => handleChange('branches', values)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Contatti */}
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Contatti
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="email" className="text-sm">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="info@example.com"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="phone" className="text-sm">Telefono</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+39 06 1234567"
                            maxLength={30}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pec" className="text-sm">PEC</Label>
                        <Input
                          id="pec"
                          type="email"
                          value={formData.pec}
                          onChange={(e) => handleChange('pec', e.target.value)}
                          placeholder="pec@example.it"
                          className="h-8 text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab 2 - Organizzazione */}
                <TabsContent value="organizzazione" className="space-y-2 mt-3">
                  {/* Card Responsabili */}
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        Responsabili
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="legal_representative" className="text-sm flex items-center gap-2">
                            <User className="h-3 w-3" />
                            Rappresentante Legale
                          </Label>
                          <Input
                            id="legal_representative"
                            value={formData.legal_representative}
                            onChange={(e) => handleChange('legal_representative', e.target.value)}
                            placeholder="Mario Rossi"
                            maxLength={255}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="rspp" className="text-sm flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            RSPP
                          </Label>
                          <Input
                            id="rspp"
                            value={formData.rspp}
                            onChange={(e) => handleChange('rspp', e.target.value)}
                            placeholder="Luigi Bianchi"
                            maxLength={255}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="rls" className="text-sm flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            RLS
                          </Label>
                          <Input
                            id="rls"
                            value={formData.rls}
                            onChange={(e) => handleChange('rls', e.target.value)}
                            placeholder="Anna Neri"
                            maxLength={255}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="doctor" className="text-sm flex items-center gap-2">
                            <Stethoscope className="h-3 w-3" />
                            Medico Competente
                          </Label>
                          <Input
                            id="doctor"
                            value={formData.doctor}
                            onChange={(e) => handleChange('doctor', e.target.value)}
                            placeholder="Dott. Giovanni Verdi"
                            maxLength={255}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Classificazione */}
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        Classificazione Personale
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1.5">
                      <div className="space-y-1">
                        <Label className="text-sm flex items-center gap-2">
                          <Briefcase className="h-3 w-3" />
                          Mansioni
                        </Label>
                        <TagListEditor
                          values={formData.mansioni || []}
                          onChange={(values) => handleChange('mansioni', values)}
                          placeholder="Aggiungi mansione..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm flex items-center gap-2">
                          <UserCog className="h-3 w-3" />
                          Aree
                        </Label>
                        <TagListEditor
                          values={formData.aree || []}
                          onChange={(values) => handleChange('aree', values)}
                          placeholder="Aggiungi area..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm flex items-center gap-2">
                          <LayoutGrid className="h-3 w-3" />
                          Reparti
                        </Label>
                        <TagListEditor
                          values={formData.reparti || []}
                          onChange={(values) => handleChange('reparti', values)}
                          placeholder="Aggiungi reparto..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <div className="flex gap-3 pt-4 border-t bg-background sticky bottom-0 z-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Salvataggio..." : company ? "Aggiorna" : "Crea"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

import { useState, useEffect } from "react";
import { Building2, MapPin, Mail, Phone, User, FileText, Stethoscope, Users, Briefcase, LayoutGrid, UserCog } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { companyApi } from "@/lib/companyApi";
import { Company, CreateCompanyData } from "@/types/company";
import { TagListEditor } from "@/components/company/TagListEditor";

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
    doctor: '',
    consultant: '',
    mansioni: [],
    reparti: [],
    ruoli: [],
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
      vat_number: companyData.vat_number || '',
      tax_code: companyData.tax_code || '',
      address: companyData.address || '',
      zip: companyData.zip || '',
      city: companyData.city || '',
      province: companyData.province || '',
      country: companyData.country || '',
      email: companyData.email || '',
      phone: companyData.phone || '',
      pec: companyData.pec || '',
      legal_representative: companyData.legal_representative || '',
      rspp: companyData.rspp || '',
      doctor: companyData.doctor || '',
      consultant: companyData.consultant || '',
      mansioni: companyData.mansioni || [],
      reparti: companyData.reparti || [],
      ruoli: companyData.ruoli || [],
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
      doctor: '',
      consultant: '',
      mansioni: [],
      reparti: [],
      ruoli: [],
    });
  };

  const handleChange = (field: keyof CreateCompanyData, value: string | string[]) => {
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
      if (company) {
        await companyApi.update(company.id, formData);
        toast({
          title: "Successo",
          description: "Azienda aggiornata con successo",
        });
      } else {
        await companyApi.create(formData);
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
      <SheetContent side="right" className="w-full sm:max-w-2xl">
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
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-6">
                {/* Informazioni Generali */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Informazioni Generali
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Azienda *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Es. Acme S.r.l."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vat_number">Partita IVA</Label>
                        <Input
                          id="vat_number"
                          value={formData.vat_number}
                          onChange={(e) => handleChange('vat_number', e.target.value)}
                          placeholder="IT12345678901"
                          maxLength={20}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax_code">Codice Fiscale</Label>
                        <Input
                          id="tax_code"
                          value={formData.tax_code}
                          onChange={(e) => handleChange('tax_code', e.target.value)}
                          placeholder="12345678901"
                          maxLength={20}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Indirizzo */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Indirizzo
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Via/Piazza</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Via Roma, 1"
                        maxLength={255}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip">CAP</Label>
                        <Input
                          id="zip"
                          value={formData.zip}
                          onChange={(e) => handleChange('zip', e.target.value)}
                          placeholder="00100"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Città</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          placeholder="Roma"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Provincia</Label>
                        <Input
                          id="province"
                          value={formData.province}
                          onChange={(e) => handleChange('province', e.target.value)}
                          placeholder="RM"
                          maxLength={5}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Paese</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="Italia"
                        maxLength={100}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contatti */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contatti
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="info@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+39 06 1234567"
                        maxLength={30}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pec">PEC</Label>
                      <Input
                        id="pec"
                        type="email"
                        value={formData.pec}
                        onChange={(e) => handleChange('pec', e.target.value)}
                        placeholder="pec@example.it"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Responsabili */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Responsabili
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="legal_representative" className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        Rappresentante Legale
                      </Label>
                      <Input
                        id="legal_representative"
                        value={formData.legal_representative}
                        onChange={(e) => handleChange('legal_representative', e.target.value)}
                        placeholder="Mario Rossi"
                        maxLength={255}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rspp" className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        RSPP (Responsabile Servizio Prevenzione e Protezione)
                      </Label>
                      <Input
                        id="rspp"
                        value={formData.rspp}
                        onChange={(e) => handleChange('rspp', e.target.value)}
                        placeholder="Luigi Bianchi"
                        maxLength={255}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor" className="flex items-center gap-2">
                        <Stethoscope className="h-3 w-3" />
                        Medico Competente
                      </Label>
                      <Input
                        id="doctor"
                        value={formData.doctor}
                        onChange={(e) => handleChange('doctor', e.target.value)}
                        placeholder="Dott. Giovanni Verdi"
                        maxLength={255}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultant" className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Consulente
                      </Label>
                      <Input
                        id="consultant"
                        value={formData.consultant}
                        onChange={(e) => handleChange('consultant', e.target.value)}
                        placeholder="Studio Associato XYZ"
                        maxLength={255}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mansioni, Reparti, Ruoli */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Classificazione Personale
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        Mansioni
                      </Label>
                      <TagListEditor
                        values={formData.mansioni || []}
                        onChange={(values) => handleChange('mansioni', values)}
                        placeholder="Aggiungi mansione..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <LayoutGrid className="h-3 w-3" />
                        Reparti
                      </Label>
                      <TagListEditor
                        values={formData.reparti || []}
                        onChange={(values) => handleChange('reparti', values)}
                        placeholder="Aggiungi reparto..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <UserCog className="h-3 w-3" />
                        Ruoli
                      </Label>
                      <TagListEditor
                        values={formData.ruoli || []}
                        onChange={(values) => handleChange('ruoli', values)}
                        placeholder="Aggiungi ruolo..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-3 pt-4 border-t">
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

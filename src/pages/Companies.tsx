import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { companyApi } from '@/lib/companyApi';
import { Company, CreateCompanyData } from '@/types/company';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
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
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getAll();
      setCompanies(data);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le aziende',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setSelectedCompany(company);
      setFormData({
        name: company.name,
        vat_number: company.vat_number || '',
        tax_code: company.tax_code || '',
        address: company.address || '',
        zip: company.zip || '',
        city: company.city || '',
        province: company.province || '',
        country: company.country || '',
        email: company.email || '',
        phone: company.phone || '',
        pec: company.pec || '',
        legal_representative: company.legal_representative || '',
        rspp: company.rspp || '',
        doctor: company.doctor || '',
        consultant: company.consultant || '',
      });
    } else {
      setSelectedCompany(null);
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
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Errore',
        description: 'Il nome è obbligatorio',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedCompany) {
        await companyApi.update(selectedCompany.id, formData);
        toast({
          title: 'Successo',
          description: 'Azienda aggiornata con successo',
        });
      } else {
        await companyApi.create(formData);
        toast({
          title: 'Successo',
          description: 'Azienda creata con successo',
        });
      }
      setDialogOpen(false);
      loadCompanies();
    } catch (error) {
      toast({
        title: 'Errore',
        description: selectedCompany ? 'Impossibile aggiornare l\'azienda' : 'Impossibile creare l\'azienda',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;

    try {
      await companyApi.delete(companyToDelete.id);
      toast({
        title: 'Successo',
        description: 'Azienda eliminata con successo',
      });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      loadCompanies();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'azienda',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: keyof CreateCompanyData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Aziende</h1>
          <p className="text-muted-foreground">Gestisci le aziende clienti</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Azienda
        </Button>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna azienda trovata</h3>
            <p className="text-muted-foreground mb-4">Inizia aggiungendo la prima azienda</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Crea Azienda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(company)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCompanyToDelete(company);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {company.vat_number && (
                  <CardDescription>P.IVA: {company.vat_number}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {company.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div>{company.address}</div>
                      {(company.zip || company.city || company.province) && (
                        <div className="text-muted-foreground">
                          {company.zip} {company.city} {company.province}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.legal_representative && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Legale Rapp.:</span>{' '}
                    {company.legal_representative}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Modifica Azienda' : 'Nuova Azienda'}
            </DialogTitle>
            <DialogDescription>
              Inserisci i dati dell'azienda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome Azienda *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">Partita IVA</Label>
                <Input
                  id="vat_number"
                  value={formData.vat_number}
                  onChange={(e) => handleChange('vat_number', e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_code">Codice Fiscale</Label>
                <Input
                  id="tax_code"
                  value={formData.tax_code}
                  onChange={(e) => handleChange('tax_code', e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">CAP</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleChange('zip', e.target.value)}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Paese</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  maxLength={30}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pec">PEC</Label>
                <Input
                  id="pec"
                  type="email"
                  value={formData.pec}
                  onChange={(e) => handleChange('pec', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="legal_representative">Rappresentante Legale</Label>
                <Input
                  id="legal_representative"
                  value={formData.legal_representative}
                  onChange={(e) => handleChange('legal_representative', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rspp">RSPP</Label>
                <Input
                  id="rspp"
                  value={formData.rspp}
                  onChange={(e) => handleChange('rspp', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Medico Competente</Label>
                <Input
                  id="doctor"
                  value={formData.doctor}
                  onChange={(e) => handleChange('doctor', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="consultant">Consulente</Label>
                <Input
                  id="consultant"
                  value={formData.consultant}
                  onChange={(e) => handleChange('consultant', e.target.value)}
                  maxLength={255}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annulla
              </Button>
              <Button type="submit">
                {selectedCompany ? 'Aggiorna' : 'Crea'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare l'azienda "{companyToDelete?.name}"?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

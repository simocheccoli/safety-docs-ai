import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { companyApi } from '@/lib/companyApi';
import { Company } from '@/types/company';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CompanyEditSheet } from '@/components/CompanyEditSheet';

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
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

  const handleOpenSheet = (company?: Company) => {
    setSelectedCompany(company || null);
    setSheetOpen(true);
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
        <Button onClick={() => handleOpenSheet()}>
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
            <Button onClick={() => handleOpenSheet()}>
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
                      onClick={() => handleOpenSheet(company)}
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

      <CompanyEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        company={selectedCompany || undefined}
        onSuccess={() => {
          setSheetOpen(false);
          loadCompanies();
        }}
      />

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

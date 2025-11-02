import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, FileCheck, AlertTriangle, FileEdit, ChevronDown, Building2, FileText, MapPin, Mail, Phone, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DVR } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { FileDetailCard } from "@/components/dvr/FileDetailCard";
import { DVRInfoEditor, statusLabels, statusColors } from "@/components/dvr/DVRInfoEditor";
import { dvrApi } from "@/lib/dvrApi";
import { DVRVersionHistory } from "@/components/dvr/DVRVersionHistory";
import { SaveRevisionDialog } from "@/components/dvr/SaveRevisionDialog";
import { CompanyEditSheet } from "@/components/CompanyEditSheet";
import { Company } from "@/types/company";
import { companyApi } from "@/lib/companyApi";

export default function DVRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dvr, setDvr] = useState<DVR | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showCompanySheet, setShowCompanySheet] = useState(false);
  const [fullCompany, setFullCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (id) {
      loadDVR();
    }
  }, [id]);

  const loadDVR = async () => {
    if (!id) return;
    try {
      const [dvrData, filesData] = await Promise.all([
        dvrApi.getDVR(id),
        dvrApi.getDVRFiles(id)
      ]);
      
      if (dvrData) {
        setDvr(dvrData);
        setFiles(filesData);
        
        // Carica i dettagli completi dell'azienda se presente
        if (dvrData.company_id) {
          try {
            const companyData = await companyApi.getById(dvrData.company_id);
            setFullCompany(companyData);
          } catch (error) {
            console.error("Errore nel caricamento dell'azienda:", error);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati del DVR",
        variant: "destructive"
      });
    }
  };

  const handleFinalize = async () => {
    if (!id || !dvr) return;
    try {
      await dvrApi.finalize(id, dvr.nome);
      loadDVR();
      toast({
        title: "DVR Finalizzato",
        description: "Il documento è stato finalizzato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile finalizzare il DVR",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!id || !dvr) return;
    
    try {
      setIsSaving(true);
      await dvrApi.updateDVR(id, {
        data_ultima_modifica: new Date().toISOString()
      });
      
      toast({
        title: "Salvato",
        description: "Le modifiche sono state salvate con successo",
      });
      
      loadDVR();
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile salvare le modifiche",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRevision = async (revisionNote: string) => {
    if (!id || !dvr) return;
    
    try {
      setIsSaving(true);
      await dvrApi.saveRevision(id, {}, revisionNote);
      
      toast({
        title: "Revisione Salvata",
        description: "La nuova revisione è stata creata con successo",
      });
      
      setShowRevisionDialog(false);
      loadDVR();
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile salvare la revisione",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFiles = () => {
    navigate(`/dvr/wizard?dvrId=${id}`);
  };

  if (!dvr) {
    return <div>DVR non trovato</div>;
  }

  const includedFiles = files.filter(f => f.inclusione_dvr);
  const excludedFiles = files.filter(f => !f.inclusione_dvr);
  const criticalFiles = files.filter(f => f.stato_elaborazione_ai === 'DA_ATTENZIONARE');

  return (
    <div className="space-y-6">
      {/* Header con torna indietro */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dvr')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dvr.nome}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Ultima modifica: {new Date(dvr.data_ultima_modifica).toLocaleString('it-IT')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[dvr.stato]}>
            {statusLabels[dvr.stato]}
          </Badge>
          <Badge variant="outline">Revisione {dvr.numero_revisione}</Badge>
        </div>
      </div>

      {/* Nota revisione - Banner prominente */}
      {dvr.revision_note && (
        <Alert className="border-primary bg-primary/5">
          <FileText className="h-5 w-5 text-primary" />
          <div className="ml-2">
            <p className="font-semibold text-primary mb-1">
              Nota Revisione {dvr.numero_revisione}
            </p>
            <AlertDescription className="text-foreground">
              {dvr.revision_note}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Info principali e azioni */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna sinistra: Info DVR e Azienda */}
        <div className="lg:col-span-2 space-y-4">
          {/* Descrizione */}
          {dvr.descrizione && (
            <p className="text-sm text-muted-foreground">
              {dvr.descrizione}
            </p>
          )}

          {/* Azienda */}
          {fullCompany ? (
            <Card className="flex-1">
              <CardContent className="pt-4 h-full">
                <div className="flex items-start justify-between gap-4 h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{fullCompany.name}</h3>
                      
                      {(fullCompany.vat_number || fullCompany.tax_code) && (
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {fullCompany.vat_number && <span>P.IVA: {fullCompany.vat_number}</span>}
                          {fullCompany.tax_code && <span>C.F.: {fullCompany.tax_code}</span>}
                        </div>
                      )}
                      
                      {fullCompany.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <div>{fullCompany.address}</div>
                            {(fullCompany.zip || fullCompany.city) && (
                              <div className="text-muted-foreground">
                                {fullCompany.zip} {fullCompany.city} {fullCompany.province}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {(fullCompany.email || fullCompany.phone) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {fullCompany.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{fullCompany.email}</span>
                            </div>
                          )}
                          {fullCompany.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{fullCompany.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowCompanySheet(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : dvr.company ? (
            <Card className="flex-1">
              <CardContent className="pt-4 h-full flex items-center">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{dvr.company.name}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1">
              <CardContent className="pt-4 h-full flex items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-5 w-5" />
                  <span className="italic">Nessuna azienda associata</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonna destra: Azioni */}
        <div className="space-y-3">
          <DVRInfoEditor dvr={dvr} onUpdate={loadDVR} />
          
          <Button 
            variant="outline" 
            onClick={handleAddFiles}
            className="w-full justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi File
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(`/dvr/${id}/document`)}
            className="w-full justify-start"
          >
            <FileEdit className="h-4 w-4 mr-2" />
            Modifica Documento
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isSaving} className="w-full justify-start">
                <Save className="h-4 w-4 mr-2" />
                Salva
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salva
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRevisionDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Salva Revisione
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {dvr.stato !== 'FINALIZZATO' && dvr.stato !== 'ARCHIVIATO' && (
            <Button onClick={handleFinalize} className="w-full justify-start">
              <FileCheck className="h-4 w-4 mr-2" />
              Finalizza DVR
            </Button>
          )}
        </div>
      </div>

      {criticalFiles.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Attenzione: {criticalFiles.length} file richiedono la tua attenzione prima della finalizzazione
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{files.length}</CardTitle>
            <CardDescription>File Totali</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">{includedFiles.length}</CardTitle>
            <CardDescription>File Inclusi</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-600">{criticalFiles.length}</CardTitle>
            <CardDescription>Da Attenzionare</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">File Elaborati</TabsTrigger>
          <TabsTrigger value="versions">Versioni</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nessun file caricato</p>
                <Button className="mt-4" onClick={handleAddFiles}>
                  <Plus className="h-4 w-4 mr-2" />
                  Carica File
                </Button>
              </CardContent>
            </Card>
          ) : (
            files.map(file => (
              <FileDetailCard 
                key={file.file_id} 
                file={file} 
                onUpdate={loadDVR}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <DVRVersionHistory 
            dvrId={id!} 
            currentVersion={dvr.numero_revisione}
            onVersionRestored={loadDVR}
          />
        </TabsContent>
      </Tabs>

      <SaveRevisionDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        onSave={handleSaveRevision}
        isSaving={isSaving}
      />

      {fullCompany && (
        <CompanyEditSheet
          open={showCompanySheet}
          onOpenChange={setShowCompanySheet}
          company={fullCompany}
          onSuccess={loadDVR}
        />
      )}
    </div>
  );
}

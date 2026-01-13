import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, FileSpreadsheet, Download, Archive, Building2, Calendar, FileText, FolderUp, Briefcase, Building, User, ChevronDown, ChevronRight, Eye, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailPageSkeleton, UploadListSkeleton, StatCardGridSkeleton } from "@/components/ui/loading-skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Elaboration, ElaborationUpload, ElaborationFile } from "@/types/elaboration";
import { 
  fetchElaborationById, 
  fetchElaborationUploads, 
  deleteUpload, 
  generateElaboration,
  downloadExcel,
  downloadZip,
  fetchFilePreview
} from "@/lib/elaborationApi";
import { useToast } from "@/hooks/use-toast";
import { NewUploadDialog } from "@/components/safety-sheets/NewUploadDialog";

interface FileWithContext extends ElaborationFile {
  mansione: string;
  reparto: string;
  ruolo: string;
}

export default function SafetySheetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [elaboration, setElaboration] = useState<Elaboration | null>(null);
  const [uploads, setUploads] = useState<ElaborationUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<number | null>(null);
  const [generatingElaboration, setGeneratingElaboration] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [expandedUploads, setExpandedUploads] = useState<Set<number>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileWithContext | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [elabResult, uploadsResult] = await Promise.all([
        fetchElaborationById(Number(id)),
        fetchElaborationUploads(Number(id))
      ]);
      
      if (!elabResult) {
        toast({
          title: "Errore",
          description: "Scheda di sicurezza non trovata",
          variant: "destructive",
        });
        navigate('/safety-sheets');
        return;
      }
      
      setElaboration(elabResult);
      setUploads(uploadsResult);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewUpload = () => {
    loadData();
    setUploadDialogOpen(false);
  };

  const handleDeleteClick = (uploadId: number) => {
    setUploadToDelete(uploadId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (uploadToDelete === null || !id) return;
    
    try {
      await deleteUpload(Number(id), uploadToDelete);
      toast({
        title: "Successo",
        description: "Caricamento eliminato con successo",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il caricamento",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUploadToDelete(null);
    }
  };

  const handleGenerateElaboration = async () => {
    if (!elaboration) return;
    
    setGeneratingElaboration(true);
    try {
      await generateElaboration(elaboration.id);
      toast({
        title: "Elaborazione avviata",
        description: "La generazione è stata avviata. Lo stato verrà aggiornato al completamento.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare la generazione",
        variant: "destructive",
      });
    } finally {
      setGeneratingElaboration(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!elaboration) return;
    
    setDownloadingExcel(true);
    try {
      await downloadExcel(elaboration.id);
      toast({
        title: "Download completato",
        description: "Il file Excel è stato scaricato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile scaricare il file Excel",
        variant: "destructive",
      });
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!elaboration) return;
    
    setDownloadingZip(true);
    try {
      await downloadZip(elaboration.id);
      toast({
        title: "Download completato",
        description: "Il file ZIP è stato scaricato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile scaricare il file ZIP",
        variant: "destructive",
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  const toggleUploadExpansion = (uploadId: number) => {
    setExpandedUploads(prev => {
      const next = new Set(prev);
      if (next.has(uploadId)) {
        next.delete(uploadId);
      } else {
        next.add(uploadId);
      }
      return next;
    });
  };

  const handlePreviewFile = async (file: FileWithContext) => {
    setPreviewFile(file);
    
    // Clean up previous blob URL
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    
    // If file has previewUrl, fetch with Bearer auth
    if (file.previewUrl) {
      setPreviewLoading(true);
      try {
        const blobUrl = await fetchFilePreview(file.previewUrl);
        setPreviewBlobUrl(blobUrl);
      } catch (error) {
        console.error('Error fetching file preview:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare l'anteprima del file",
          variant: "destructive",
        });
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string, size: 'sm' | 'lg' = 'sm') => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      bozza: { label: "Bozza", variant: "secondary" },
      pending: { label: "In attesa", variant: "outline" },
      elaborating: { label: "In elaborazione", variant: "default", className: "bg-amber-500 hover:bg-amber-500" },
      completed: { label: "Completato", variant: "default", className: "bg-green-600 hover:bg-green-600" },
      error: { label: "Errore", variant: "destructive" },
    };
    const config = configs[status] || configs.bozza;
    return (
      <Badge 
        variant={config.variant} 
        className={`${config.className || ''} ${size === 'lg' ? 'px-3 py-1 text-sm' : ''}`}
      >
        {status === 'elaborating' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!elaboration) {
    return null;
  }

  const canGenerate = uploads.length > 0 && (elaboration.status === 'bozza' || elaboration.status === 'pending');
  const canDownloadExcel = elaboration.status === 'completed';
  const canDownloadZip = elaboration.status === 'completed';
  const isProcessing = elaboration.status === 'elaborating';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/safety-sheets')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  {elaboration.title}
                </h1>
                {getStatusBadge(elaboration.status, 'lg')}
              </div>
              {elaboration.description && (
                <p className="text-sm text-muted-foreground mt-1">{elaboration.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {elaboration.company_name && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{elaboration.company_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Creato il {formatDate(elaboration.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateElaboration}
              disabled={!canGenerate || generatingElaboration || isProcessing}
              className="gap-2"
            >
              {generatingElaboration || isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Genera Excel
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDownloadExcel}
                  disabled={!canDownloadExcel || downloadingExcel}
                >
                  {downloadingExcel ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scarica Excel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDownloadZip}
                  disabled={!canDownloadZip || downloadingZip}
                >
                  {downloadingZip ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scarica ZIP</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FolderUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{uploads.length}</div>
                  <div className="text-sm text-muted-foreground">Caricamenti</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {uploads.reduce((acc, u) => acc + u.files.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Allegati totali</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(uploads.map(u => u.reparto)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Reparti</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Uploads List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Caricamenti</CardTitle>
              <CardDescription>
                Elenco dei caricamenti suddivisi per mansione, reparto e ruolo. Clicca su un caricamento per vedere gli allegati.
              </CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Caricamento
            </Button>
          </CardHeader>
          <CardContent>
            {uploads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessun caricamento presente</p>
                <p className="text-sm mt-1">Aggiungi un nuovo caricamento per iniziare</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploads.map((upload) => {
                  const isExpanded = expandedUploads.has(upload.id);
                  return (
                    <Collapsible
                      key={upload.id}
                      open={isExpanded}
                      onOpenChange={() => toggleUploadExpansion(upload.id)}
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-muted-foreground">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex items-center gap-6 flex-1">
                                <div className="min-w-[140px]">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                                    <Briefcase className="h-3 w-3" />
                                    Mansione
                                  </div>
                                  <div className="font-medium">{upload.mansione}</div>
                                </div>
                                <div className="min-w-[120px]">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                                    <Building className="h-3 w-3" />
                                    Reparto
                                  </div>
                                  <div className="font-medium">{upload.reparto}</div>
                                </div>
                                <div className="min-w-[100px]">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                                    <User className="h-3 w-3" />
                                    Ruolo
                                  </div>
                                  <div className="font-medium">{upload.ruolo}</div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{upload.files.length} allegati</span>
                                </div>
                                <div>{getStatusBadge(upload.status)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(upload.createdAt || upload.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(upload.id)}
                                    className="hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive/70" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Elimina caricamento</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t bg-muted/20 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {upload.files.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:border-primary/50 transition-colors group"
                                >
                                  <div className="p-2 bg-destructive/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-destructive" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate" title={file.filename}>
                                      {file.filename}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </div>
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handlePreviewFile({
                                          ...file,
                                          mansione: upload.mansione,
                                          reparto: upload.reparto,
                                          ruolo: upload.ruolo
                                        })}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Anteprima PDF</TooltipContent>
                                  </Tooltip>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <NewUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          elaborationId={elaboration.id}
          companyId={elaboration.company_id}
          onSuccess={handleNewUpload}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare questo caricamento? Tutti gli allegati associati verranno rimossi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* PDF Preview Sheet */}
        <Sheet open={!!previewFile} onOpenChange={(open) => !open && handleClosePreview()}>
          <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-destructive" />
                  <span className="truncate">{previewFile?.filename}</span>
                </SheetTitle>
              </div>
              {previewFile && (
                <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{previewFile.mansione}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    <span>{previewFile.reparto}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{previewFile.ruolo}</span>
                  </div>
                </div>
              )}
            </SheetHeader>
            <div className="flex-1 bg-muted/30 overflow-hidden">
              {previewFile && (
                <>
                  {previewLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Caricamento anteprima...</p>
                      </div>
                    </div>
                  ) : previewBlobUrl ? (
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-full border-0"
                      title={`Anteprima di ${previewFile.filename}`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center p-8">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-destructive/50" />
                        <p className="font-medium mb-2">{previewFile.filename}</p>
                        <p className="text-sm mb-4">{formatFileSize(previewFile.size)}</p>
                        <p className="text-xs text-muted-foreground">
                          {previewFile.previewUrl 
                            ? "Errore nel caricamento dell'anteprima."
                            : "Anteprima non disponibile per questo file."}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

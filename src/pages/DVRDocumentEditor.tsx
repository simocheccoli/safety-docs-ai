import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText, Code, FileEdit, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dvrApi } from "@/lib/dvrApi";
import { DVR } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { DocumentEditor } from "@/components/dvr/DocumentEditor";
import { useDvrDocument } from "@/hooks/useDvrDocument";
import { SuperDoc } from "@harbour-enterprises/superdoc";
import "@harbour-enterprises/superdoc/style.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function DVRDocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dvr, setDvr] = useState<DVR | null>(null);
  const [dvrLoading, setDvrLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState("");
  const [editorMode, setEditorMode] = useState<'html' | 'superdoc'>('html');
  const superDocRef = useRef<any>(null);
  const superDocContainerRef = useRef<HTMLDivElement>(null);

  // Use the document hook for all document operations
  const {
    html,
    setHtml,
    loading: documentLoading,
    saving,
    regenerating,
    exporting,
    downloadUrl,
    saveDocument,
    regenerateDocument,
    exportDocument,
  } = useDvrDocument({
    dvrId: id || '',
    autoSaveDelay: 0, // Manual save only
  });

  useEffect(() => {
    if (id) {
      loadDVR();
    }
  }, [id]);

  const loadDVR = async () => {
    if (!id) return;
    
    try {
      setDvrLoading(true);
      const dvrData = await dvrApi.getDVR(id);
      
      if (dvrData) {
        setDvr(dvrData);
        setDocumentTitle(dvrData.nome);
      } else {
        toast({
          title: "Errore",
          description: "DVR non trovato",
          variant: "destructive",
        });
        navigate('/dvr');
      }
    } catch (error) {
      console.error("Errore caricamento DVR:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il DVR",
        variant: "destructive",
      });
      navigate('/dvr');
    } finally {
      setDvrLoading(false);
    }
  };

  useEffect(() => {
    if (editorMode === 'superdoc' && superDocContainerRef.current) {
      // Se c'è già un'istanza, distruggi e ricrea con il nuovo documento
      if (superDocRef.current) {
        try {
          superDocRef.current.destroy();
        } catch (e) {
          console.log('Cleanup SuperDoc:', e);
        }
        superDocRef.current = null;
      }
      initializeSuperDoc();
    }
    
    return () => {
      if (superDocRef.current) {
        try {
          superDocRef.current.destroy();
        } catch (e) {
          console.log('Cleanup SuperDoc:', e);
        }
        superDocRef.current = null;
      }
    };
  }, [editorMode, downloadUrl]);

  const initializeSuperDoc = () => {
    try {
      if (superDocContainerRef.current) {
        // Use the generated docx if available, otherwise use template
        const documentPath = downloadUrl || '/templates/dvr_template.docx';
        
        superDocRef.current = new SuperDoc({
          selector: '#superdoc-container',
          toolbar: '#superdoc-toolbar',
          document: documentPath,
          documentMode: 'editing',
          pagination: true,
          rulers: true,
          onReady: (event: any) => {
            console.log('SuperDoc pronto', event);
            toast({
              title: "Editor Caricato",
              description: downloadUrl ? "Documento caricato con successo" : "Template DVR caricato con successo",
            });
          },
          onEditorCreate: (event: any) => {
            console.log('Editor SuperDoc creato', event);
          }
        });
      }
    } catch (error) {
      console.error('Errore inizializzazione SuperDoc:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'editor SuperDoc",
        variant: "destructive",
      });
    }
  };

  const handleExportDocx = async () => {
    if (!superDocRef.current) return;
    
    try {
      const blob = await superDocRef.current.exportAsDocx();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Documento Esportato",
        description: "Il documento è stato scaricato come file DOCX",
      });
    } catch (error) {
      console.error('Errore esportazione DOCX:', error);
      toast({
        title: "Errore",
        description: "Impossibile esportare il documento",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async () => {
    try {
      await regenerateDocument();
    } catch (error) {
      console.error('Errore rigenerazione:', error);
    }
  };

  const handleExportAPI = async (format: 'docx' | 'pdf') => {
    try {
      await exportDocument(format);
    } catch (error) {
      console.error('Errore esportazione:', error);
    }
  };

  const isLoading = dvrLoading || documentLoading;
  const isProcessing = saving || regenerating || exporting;

  if (isLoading || !dvr) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/dvr/${id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                placeholder="Titolo documento"
              />
              <p className="text-xs text-muted-foreground">
                Revisione {dvr.numero_revisione}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as 'html' | 'superdoc')}>
              <TabsList>
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Editor HTML
                </TabsTrigger>
                <TabsTrigger value="superdoc" className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  Editor DOCX
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {editorMode === 'html' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleRegenerate}
                  disabled={isProcessing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                  Rigenera da Template
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportAPI('docx')}
                  disabled={isProcessing}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Esporta DOCX
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportAPI('pdf')}
                  disabled={isProcessing}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Esporta PDF
                </Button>
                <Button 
                  onClick={saveDocument}
                  disabled={isProcessing}
                >
                  <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
                  {saving ? 'Salvataggio...' : 'Salva Documento'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleExportDocx} disabled={isProcessing}>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta DOCX
                </Button>
                <Button onClick={saveDocument} disabled={isProcessing}>
                  <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
                  {saving ? 'Salvataggio...' : 'Salva Documento'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-screen-2xl mx-auto p-4">
          {editorMode === 'html' ? (
            <DocumentEditor 
              content={html} 
              onChange={setHtml}
            />
          ) : (
            <div className="h-full flex flex-col space-y-2">
              <div id="superdoc-toolbar" className="border rounded-lg p-2 bg-background"></div>
              <div 
                id="superdoc-container" 
                ref={superDocContainerRef}
                className="flex-1 border rounded-lg overflow-auto bg-background"
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
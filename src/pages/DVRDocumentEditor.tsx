import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText, Code, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dvrApi } from "@/lib/dvrApi";
import { DVR } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { DocumentEditor } from "@/components/dvr/DocumentEditor";
import { SuperDoc } from "@harbour-enterprises/superdoc";
import "@harbour-enterprises/superdoc/style.css";

export default function DVRDocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dvr, setDvr] = useState<DVR | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [editorMode, setEditorMode] = useState<'html' | 'superdoc'>('html');
  const superDocRef = useRef<any>(null);
  const superDocContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadDVR();
    }
  }, [id]);

  const loadDVR = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const dvrData = await dvrApi.getDVR(id);
      
      if (dvrData) {
        setDvr(dvrData);
        // Carica il contenuto del documento salvato o inizializza con template
        const savedContent = localStorage.getItem(`dvr_document_${id}`);
        const savedTitle = localStorage.getItem(`dvr_document_title_${id}`);
        
        if (savedContent) {
          setDocumentContent(savedContent);
          setDocumentTitle(savedTitle || dvrData.nome);
        } else {
          // Template iniziale
          setDocumentTitle(dvrData.nome);
          setDocumentContent(`
            <h1>Documento di Valutazione dei Rischi</h1>
            <h2>${dvrData.nome}</h2>
            <p><strong>Revisione:</strong> ${dvrData.numero_revisione}</p>
            <p><strong>Data di creazione:</strong> ${new Date(dvrData.data_creazione).toLocaleDateString('it-IT')}</p>
            <br/>
            <h2>1. Introduzione</h2>
            <p>Il presente documento costituisce il Documento di Valutazione dei Rischi redatto in conformità al D.Lgs. 81/2008.</p>
            <br/>
            <h2>2. Dati Aziendali</h2>
            <p>Inserire qui i dati dell'azienda...</p>
            <br/>
            <h2>3. Valutazione dei Rischi</h2>
            <p>Descrizione della valutazione dei rischi effettuata...</p>
            <br/>
            <h2>4. Misure di Prevenzione e Protezione</h2>
            <p>Elenco delle misure adottate...</p>
            <br/>
            <h2>5. Conclusioni</h2>
            <p>Conclusioni della valutazione...</p>
          `);
        }
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editorMode === 'superdoc' && superDocContainerRef.current && !superDocRef.current) {
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
  }, [editorMode]);

  const initializeSuperDoc = () => {
    try {
      if (superDocContainerRef.current && !superDocRef.current) {
        superDocRef.current = new SuperDoc({
          selector: '#superdoc-container',
          toolbar: '#superdoc-toolbar',
          documentMode: 'editing',
          pagination: true,
          rulers: true,
          onReady: (event: any) => {
            console.log('SuperDoc pronto', event);
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

  const handleSave = () => {
    if (!id) return;
    
    // Salva il contenuto nel localStorage
    localStorage.setItem(`dvr_document_${id}`, documentContent);
    localStorage.setItem(`dvr_document_title_${id}`, documentTitle);
    
    toast({
      title: "Documento Salvato",
      description: "Le modifiche al documento sono state salvate con successo",
    });
  };

  const handleExport = () => {
    // Crea un blob con il contenuto HTML
    const blob = new Blob([documentContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Documento Esportato",
      description: "Il documento è stato scaricato come file HTML",
    });
  };

  if (loading || !dvr) {
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
                <Button variant="outline" onClick={handleExport}>
                  Esporta HTML
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salva Documento
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleExportDocx}>
                  Esporta DOCX
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salva Documento
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
              content={documentContent} 
              onChange={setDocumentContent}
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
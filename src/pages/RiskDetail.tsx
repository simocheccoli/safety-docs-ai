import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskType, RiskStatus } from "@/types/risk";
import { getRiskTypeById, saveRiskType } from "@/lib/riskStorage";
import { GeneralInfoTab } from "@/components/risk-detail/GeneralInfoTab";
import { InputExpectationsTab } from "@/components/risk-detail/InputExpectationsTab";
import { OutputStructureTab } from "@/components/risk-detail/OutputStructureTab";
import { PromptTab } from "@/components/risk-detail/PromptTab";
import { TestTab } from "@/components/risk-detail/TestTab";
import { toast } from "@/hooks/use-toast";
import { generateAIPrompt } from "@/lib/promptGenerator";

const RiskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RiskStatus>("draft");
  const [inputExpectations, setInputExpectations] = useState("");
  const [outputStructure, setOutputStructure] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    if (id && id !== "new") {
      const risk = getRiskTypeById(id);
      if (risk) {
        setName(risk.name);
        setDescription(risk.description);
        setStatus(risk.status);
        setInputExpectations(risk.inputExpectations);
        setOutputStructure(risk.outputStructure);
        setAiPrompt(risk.aiPrompt);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del rischio è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    const risk: RiskType = {
      id: id === "new" ? Date.now().toString() : id!,
      name,
      description,
      status,
      inputExpectations,
      outputStructure,
      aiPrompt,
      createdAt: id === "new" ? new Date().toISOString() : getRiskTypeById(id!)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRiskType(risk);
    window.dispatchEvent(new Event('riskTypesUpdated'));
    
    toast({
      title: "Rischio salvato",
      description: "Le modifiche sono state salvate con successo.",
    });

    navigate("/rischi");
  };

  const handleRegeneratePrompt = () => {
    const newPrompt = generateAIPrompt(name, inputExpectations, outputStructure);
    setAiPrompt(newPrompt);
    toast({
      title: "Prompt rigenerato",
      description: "Il prompt AI è stato aggiornato.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/rischi")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna all'elenco
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {id === "new" ? "Nuovo Rischio" : "Modifica Rischio"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {name || "Configura il rischio per l'elaborazione AI"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salva
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Informazioni</TabsTrigger>
          <TabsTrigger value="input">Cosa troverà l'AI</TabsTrigger>
          <TabsTrigger value="output">Struttura Output</TabsTrigger>
          <TabsTrigger value="prompt">Prompt AI</TabsTrigger>
          <TabsTrigger value="test">Test Live</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralInfoTab
            name={name}
            description={description}
            status={status}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onStatusChange={setStatus}
          />
        </TabsContent>

        <TabsContent value="input">
          <InputExpectationsTab
            value={inputExpectations}
            onChange={setInputExpectations}
          />
        </TabsContent>

        <TabsContent value="output">
          <OutputStructureTab
            fields={outputStructure}
            onChange={setOutputStructure}
          />
        </TabsContent>

        <TabsContent value="prompt">
          <PromptTab
            prompt={aiPrompt}
            onRegenerate={handleRegeneratePrompt}
          />
        </TabsContent>

        <TabsContent value="test">
          <TestTab
            riskId={id === "new" ? undefined : id}
            inputExpectations={inputExpectations}
            outputStructure={outputStructure}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskDetail;

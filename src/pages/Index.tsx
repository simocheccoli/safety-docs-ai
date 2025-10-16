import { ElaborationCard } from "@/components/ElaborationCard";
import { NewElaborationDialog } from "@/components/NewElaborationDialog";
import { Elaboration } from "@/types/elaboration";
import { Shield, FileSearch } from "lucide-react";

// Mock data per dimostrare i vari stati
const mockElaborations: Elaboration[] = [
  {
    id: "1",
    name: "Prodotti Chimici Magazzino A",
    status: "processing",
    filesCount: 15,
    createdAt: new Date(2025, 0, 13),
    progress: 65,
  },
  {
    id: "2",
    name: "Sostanze Pericolose Lab 2",
    status: "completed",
    filesCount: 8,
    createdAt: new Date(2025, 0, 10),
    completedAt: new Date(2025, 0, 12),
    excelUrl: "/downloads/elaborazione-2.xlsx",
  },
  {
    id: "3",
    name: "Analisi Rischio Chimico Q4 2024",
    status: "completed",
    filesCount: 23,
    createdAt: new Date(2024, 11, 15),
    completedAt: new Date(2024, 11, 18),
    excelUrl: "/downloads/elaborazione-3.xlsx",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">HSEB5</h1>
                <p className="text-sm text-muted-foreground">
                  Gestione Schede di Sicurezza
                </p>
              </div>
            </div>
            <NewElaborationDialog />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Le Tue Elaborazioni
          </h2>
          <p className="text-muted-foreground">
            Gestisci e monitora le elaborazioni OCR delle schede di sicurezza
          </p>
        </div>

        {mockElaborations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
              <FileSearch className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              Nessuna elaborazione ancora
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Inizia caricando le tue schede di sicurezza per avviare la prima
              elaborazione OCR
            </p>
            <NewElaborationDialog />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockElaborations.map((elaboration) => (
              <ElaborationCard key={elaboration.id} elaboration={elaboration} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

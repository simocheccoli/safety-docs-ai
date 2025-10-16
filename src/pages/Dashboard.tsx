import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FlaskConical, Clock, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Schede Totali",
      value: "12",
      icon: FileText,
      description: "Elaborazioni totali",
    },
    {
      title: "In Elaborazione",
      value: "3",
      icon: Clock,
      description: "Processi attivi",
    },
    {
      title: "Completate",
      value: "9",
      icon: CheckCircle2,
      description: "Elaborazioni finite",
    },
    {
      title: "Rischio Chimico",
      value: "100%",
      icon: FlaskConical,
      description: "Copertura analisi",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Panoramica generale del sistema HSEB5
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health . Safety . Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              La sicurezza nasce dall'equilibrio tra salute, prevenzione e ambiente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analisi del rischio chimico con AI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              OCR + AI per leggere automaticamente schede di sicurezza.
              Dati aggiornati, gestione veloce, zero errori.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

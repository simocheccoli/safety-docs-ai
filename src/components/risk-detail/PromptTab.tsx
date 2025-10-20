import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PromptTabProps {
  prompt: string;
  onRegenerate: () => void;
}

export function PromptTab({ prompt, onRegenerate }: PromptTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prompt AI</CardTitle>
            <CardDescription>
              Prompt generato automaticamente per l'elaborazione AI
            </CardDescription>
          </div>
          <Button onClick={onRegenerate} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rigenera Prompt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={prompt}
          readOnly
          rows={20}
          className="font-mono text-sm bg-muted"
        />
      </CardContent>
    </Card>
  );
}

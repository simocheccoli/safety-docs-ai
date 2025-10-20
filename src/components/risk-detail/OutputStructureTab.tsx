import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OutputField } from "@/types/risk";
import { FieldBuilder } from "@/components/risk-detail/FieldBuilder";

interface OutputStructureTabProps {
  fields: OutputField[];
  onChange: (fields: OutputField[]) => void;
}

export function OutputStructureTab({ fields, onChange }: OutputStructureTabProps) {
  const handleAddField = () => {
    onChange([
      ...fields,
      {
        name: "",
        type: "string",
        description: "",
        required: false,
      },
    ]);
  };

  const handleUpdateField = (index: number, field: OutputField) => {
    const newFields = [...fields];
    newFields[index] = field;
    onChange(newFields);
  };

  const handleDeleteField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const generatePreviewJSON = () => {
    const obj: any = {};
    fields.forEach(field => {
      if (field.name) {
        if (field.type === 'array') {
          obj[field.name] = field.children && field.children.length > 0 
            ? [generateChildPreview(field.children)]
            : ["string"];
        } else if (field.type === 'object') {
          obj[field.name] = field.children ? generateChildPreview(field.children) : {};
        } else {
          obj[field.name] = field.type;
        }
      }
    });
    return obj;
  };

  const generateChildPreview = (children: OutputField[]): any => {
    const obj: any = {};
    children.forEach(child => {
      if (child.name) {
        if (child.type === 'array') {
          obj[child.name] = child.children && child.children.length > 0
            ? [generateChildPreview(child.children)]
            : ["string"];
        } else if (child.type === 'object') {
          obj[child.name] = child.children ? generateChildPreview(child.children) : {};
        } else {
          obj[child.name] = child.type;
        }
      }
    });
    return obj;
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Struttura Output Atteso</CardTitle>
          <CardDescription>
            Definisci i campi che l'AI dovrà estrarre dal documento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <FieldBuilder
              key={index}
              field={field}
              onChange={(updated) => handleUpdateField(index, updated)}
              onDelete={() => handleDeleteField(index)}
            />
          ))}
          
          <Button onClick={handleAddField} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Campo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview JSON</CardTitle>
          <CardDescription>
            Anteprima della struttura dati generata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px] text-sm">
            {JSON.stringify(generatePreviewJSON(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

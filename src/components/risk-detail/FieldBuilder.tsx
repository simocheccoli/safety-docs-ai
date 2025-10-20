import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OutputField } from "@/types/risk";

interface FieldBuilderProps {
  field: OutputField;
  onChange: (field: OutputField) => void;
  onDelete: () => void;
  level?: number;
}

export function FieldBuilder({ field, onChange, onDelete, level = 0 }: FieldBuilderProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = field.type === 'array' || field.type === 'object';

  const handleAddChild = () => {
    onChange({
      ...field,
      children: [
        ...(field.children || []),
        {
          name: "",
          type: "string",
          description: "",
          required: false,
        },
      ],
    });
    setExpanded(true);
  };

  const handleUpdateChild = (index: number, child: OutputField) => {
    const newChildren = [...(field.children || [])];
    newChildren[index] = child;
    onChange({ ...field, children: newChildren });
  };

  const handleDeleteChild = (index: number) => {
    onChange({
      ...field,
      children: field.children?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className={`border rounded-lg p-4 ${level > 0 ? 'ml-6 bg-muted/50' : 'bg-card'}`}>
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-6"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Campo</Label>
              <Input
                value={field.name}
                onChange={(e) => onChange({ ...field, name: e.target.value })}
                placeholder="es. hazard_description"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={field.type}
                onValueChange={(value: any) => onChange({ ...field, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">Stringa</SelectItem>
                  <SelectItem value="number">Numero</SelectItem>
                  <SelectItem value="boolean">Booleano</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Oggetto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Descrizione</Label>
              <Input
                value={field.description}
                onChange={(e) => onChange({ ...field, description: e.target.value })}
                placeholder="Descrizione del campo..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`required-${field.name}`}
                checked={field.required}
                onCheckedChange={(checked) => onChange({ ...field, required: !!checked })}
              />
              <Label htmlFor={`required-${field.name}`} className="cursor-pointer">
                Campo obbligatorio
              </Label>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="mt-6"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {hasChildren && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddChild}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Campo Figlio
            </Button>
          </div>
        )}
      </div>

      {hasChildren && expanded && field.children && field.children.length > 0 && (
        <div className="mt-4 space-y-4">
          {field.children.map((child, index) => (
            <FieldBuilder
              key={index}
              field={child}
              onChange={(updated) => handleUpdateChild(index, updated)}
              onDelete={() => handleDeleteChild(index)}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

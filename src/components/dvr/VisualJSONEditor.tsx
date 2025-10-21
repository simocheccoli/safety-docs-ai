import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VisualJSONEditorProps {
  data: any;
  onChange: (data: any) => void;
}

type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export function VisualJSONEditor({ data, onChange }: VisualJSONEditorProps) {
  return (
    <div className="space-y-2">
      <JSONNode
        path={[]}
        value={data}
        onChange={onChange}
        isRoot={true}
      />
    </div>
  );
}

interface JSONNodeProps {
  path: string[];
  value: any;
  onChange: (newData: any) => void;
  isRoot?: boolean;
  onDelete?: () => void;
}

function JSONNode({ path, value, onChange, isRoot = false, onDelete }: JSONNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(path[path.length - 1] || '');
  const [editValue, setEditValue] = useState(value);

  const currentKey = path[path.length - 1];
  const valueType = getValueType(value);

  const updateValue = (newValue: any) => {
    onChange(newValue);
  };

  const handleSaveEdit = () => {
    updateValue(editValue);
    setIsEditing(false);
  };

  const handleAddField = () => {
    if (valueType === 'object') {
      const newKey = `nuovo_campo_${Object.keys(value || {}).length + 1}`;
      updateValue({ ...value, [newKey]: '' });
    } else if (valueType === 'array') {
      updateValue([...(value || []), '']);
    }
  };

  const handleDeleteField = (key: string | number) => {
    if (valueType === 'object') {
      const newValue = { ...value };
      delete newValue[key];
      updateValue(newValue);
    } else if (valueType === 'array') {
      const newValue = [...value];
      newValue.splice(key as number, 1);
      updateValue(newValue);
    }
  };

  const handleUpdateChild = (key: string | number, newChildValue: any) => {
    if (valueType === 'object') {
      updateValue({ ...value, [key]: newChildValue });
    } else if (valueType === 'array') {
      const newValue = [...value];
      newValue[key as number] = newChildValue;
      updateValue(newValue);
    }
  };

  const renderSimpleValue = () => {
    if (isEditing) {
      return (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editValue}
            onChange={(e) => {
              const val = e.target.value;
              if (valueType === 'number') {
                setEditValue(parseFloat(val) || 0);
              } else if (valueType === 'boolean') {
                setEditValue(val === 'true');
              } else {
                setEditValue(val);
              }
            }}
            className="h-8"
          />
          <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm px-2 py-1 bg-muted rounded">
          {String(value)}
        </span>
        <Badge variant="outline" className="text-xs">
          {valueType}
        </Badge>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-3 w-3" />
        </Button>
        {!isRoot && onDelete && (
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const renderComplexValue = () => {
    const entries = valueType === 'object' 
      ? Object.entries(value || {})
      : (value || []).map((v: any, i: number) => [i, v]);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Badge variant="outline">
            {valueType} ({entries.length} {valueType === 'array' ? 'elementi' : 'campi'})
          </Badge>
          <Button size="sm" variant="outline" onClick={handleAddField}>
            <Plus className="h-3 w-3 mr-1" />
            Aggiungi
          </Button>
          {!isRoot && onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="ml-6 border-l-2 border-muted pl-4 space-y-2">
            {entries.map(([key, childValue]) => (
              <div key={key}>
                <JSONNode
                  path={[...path, String(key)]}
                  value={childValue}
                  onChange={(newChildValue) => handleUpdateChild(key, newChildValue)}
                  onDelete={() => handleDeleteField(key)}
                />
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Nessun elemento. Clicca "Aggiungi" per inserire dati.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-3">
      <div className="space-y-2">
        {!isRoot && (
          <div className="flex items-center gap-2">
            <Label className="font-semibold text-sm">
              {valueType === 'array' ? `[${currentKey}]` : currentKey}
            </Label>
          </div>
        )}

        {valueType === 'object' || valueType === 'array' 
          ? renderComplexValue() 
          : renderSimpleValue()
        }
      </div>
    </Card>
  );
}

function getValueType(value: any): ValueType {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'string';
  const type = typeof value;
  if (type === 'object') return 'object';
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  return 'string';
}

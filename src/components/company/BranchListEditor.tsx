import { useState } from "react";
import { X, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CompanyBranch } from "@/types/company";

interface BranchListEditorProps {
  values: CompanyBranch[];
  onChange: (values: CompanyBranch[]) => void;
}

export function BranchListEditor({ values, onChange }: BranchListEditorProps) {
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const handleAdd = () => {
    const trimmedName = newBranchName.trim();
    if (trimmedName) {
      const newBranch: CompanyBranch = {
        name: trimmedName,
        address: newBranchAddress.trim() || undefined,
        is_main: values.length === 0, // First branch is main by default
      };

      // If this is set as main, unset others
      if (newBranch.is_main) {
        const updated = values.map(b => ({ ...b, is_main: false }));
        onChange([...updated, newBranch]);
      } else {
        onChange([...values, newBranch]);
      }

      setNewBranchName("");
      setNewBranchAddress("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    const branch = values[index];
    setEditingIndex(index);
    setEditName(branch.name);
    setEditAddress(branch.address || "");
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const updated = [...values];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editName.trim(),
      address: editAddress.trim() || undefined,
    };
    onChange(updated);
    setEditingIndex(null);
    setEditName("");
    setEditAddress("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditName("");
    setEditAddress("");
  };

  const handleToggleMain = (index: number) => {
    const updated = values.map((branch, i) => ({
      ...branch,
      is_main: i === index,
    }));
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Add new branch form */}
      <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
        <div className="flex gap-2">
          <Input
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome stabilimento..."
            className="flex-1"
          />
          <Input
            value={newBranchAddress}
            onChange={(e) => setNewBranchAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Indirizzo (opzionale)..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={!newBranchName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List of branches */}
      {values.length > 0 && (
        <div className="space-y-2">
          {values.map((branch, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 border rounded-lg bg-background"
            >
              {editingIndex === index ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nome stabilimento..."
                  />
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Indirizzo (opzionale)..."
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSaveEdit}
                    >
                      Salva
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{branch.name}</span>
                      {branch.is_main && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          Principale
                        </Badge>
                      )}
                    </div>
                    {branch.address && (
                      <div className="text-sm text-muted-foreground">
                        {branch.address}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`main-${index}`}
                        checked={branch.is_main || false}
                        onCheckedChange={() => handleToggleMain(index)}
                      />
                      <Label
                        htmlFor={`main-${index}`}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        Principale
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(index)}
                      className="h-8 w-8"
                    >
                      <span className="text-xs">Modifica</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

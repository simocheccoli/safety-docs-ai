import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateCompanyData } from "@/types/company";

interface QuickCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateCompanyData) => Promise<void>;
}

export function QuickCompanyDialog({ open, onOpenChange, onSave }: QuickCompanyDialogProps) {
  const [name, setName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setVatNumber("");
    setEmail("");
    setPhone("");
    setCity("");
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        vat_number: vatNumber.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Creazione Rapida Azienda</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome Azienda *</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es: Acme S.r.l."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat-number">Partita IVA</Label>
            <Input
              id="vat-number"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="IT12345678901"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@azienda.it"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Telefono</Label>
              <Input
                id="company-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02 1234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-city">Città</Label>
            <Input
              id="company-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Milano"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? "Salvataggio..." : "Crea Azienda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

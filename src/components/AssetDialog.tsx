import { useEffect, useState } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import { Asset, AssetStatus } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import AssetHistory from "./AssetHistory";

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset;
}

export default function AssetDialog({ open, onOpenChange, asset }: AssetDialogProps) {
  const { addAsset, updateAsset, deleteAsset, changeStatus } = useAssets();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    subtype: "",
    description: "",
    serialNumber: "",
    responsible: "",
    location: "",
    cost: 0,
    status: "active" as AssetStatus,
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        type: asset.type,
        subtype: asset.subtype || "",
        description: asset.description || "",
        serialNumber: asset.serialNumber || "",
        responsible: asset.responsible,
        location: asset.location,
        cost: asset.cost,
        status: asset.status,
      });
    } else {
      setFormData({
        name: "",
        type: "",
        subtype: "",
        description: "",
        serialNumber: "",
        responsible: "",
        location: "",
        cost: 0,
        status: "active",
      });
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (asset) {
      updateAsset(asset.id, formData);
      toast({
        title: "Activo actualizado",
        description: "Los cambios se guardaron correctamente",
      });
    } else {
      addAsset(formData);
      toast({
        title: "Activo creado",
        description: "El activo se agregó al inventario",
      });
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (asset && confirm("¿Estás seguro de eliminar este activo?")) {
      deleteAsset(asset.id);
      toast({
        title: "Activo eliminado",
        description: "El activo fue removido del inventario",
      });
      onOpenChange(false);
    }
  };

  const handleStatusChange = (status: AssetStatus) => {
    if (asset) {
      changeStatus(asset.id, status);
      setFormData({ ...formData, status });
      toast({
        title: "Estado actualizado",
        description: `El activo ahora está ${status}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Editar Activo" : "Nuevo Activo"}</DialogTitle>
          <DialogDescription>
            {asset ? "Modifica la información del activo" : "Completa el formulario para agregar un nuevo activo"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            {asset && <TabsTrigger value="history">Historial</TabsTrigger>}
          </TabsList>

          <TabsContent value="info">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtype">Subtipo</Label>
                  <Input
                    id="subtype"
                    value={formData.subtype}
                    onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Serie</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsable *</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo *</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: AssetStatus) => asset ? handleStatusChange(value) : setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="decommissioned">Desincorporado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <div>
                  {asset && (
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{asset ? "Guardar Cambios" : "Crear Activo"}</Button>
                </div>
              </DialogFooter>
            </form>
          </TabsContent>

          {asset && (
            <TabsContent value="history">
              <AssetHistory assetId={asset.id} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

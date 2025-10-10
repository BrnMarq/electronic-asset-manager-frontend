import { useState } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download } from "lucide-react";
import AssetDialog from "@/components/AssetDialog";
import { Asset } from "@/types";

export default function Assets() {
  const { assets } = useAssets();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();

  const filteredAssets = assets.filter((asset) =>
    Object.values(asset).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedAsset(undefined);
    setDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Nombre", "Tipo", "Serial", "Responsable", "Ubicación", "Costo", "Estado"];
    const rows = assets.map((a) => [
      a.id,
      a.name,
      a.type,
      a.serialNumber || "",
      a.responsible,
      a.location,
      a.cost,
      a.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      active: { variant: "default", label: "Activo" },
      inactive: { variant: "secondary", label: "Inactivo" },
      decommissioned: { variant: "destructive", label: "Desincorporado" },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Activos</h1>
          <p className="text-muted-foreground mt-1">{filteredAssets.length} activos encontrados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Activos</CardTitle>
          <CardDescription>Filtra por cualquier campo del activo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, tipo, serial, ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <Card
            key={asset.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleEdit(asset)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {asset.type} {asset.subtype && `• ${asset.subtype}`}
                  </CardDescription>
                </div>
                {getStatusBadge(asset.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p className="text-muted-foreground">Serial: {asset.serialNumber || "N/A"}</p>
                <p className="text-muted-foreground">Responsable: {asset.responsible}</p>
                <p className="text-muted-foreground">Ubicación: {asset.location}</p>
                <p className="font-semibold mt-2 text-primary">Costo: ${asset.cost.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron activos</p>
          </CardContent>
        </Card>
      )}

      <AssetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        asset={selectedAsset}
      />
    </div>
  );
}

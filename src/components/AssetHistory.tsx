import { useAssets } from "@/contexts/AssetsContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface AssetHistoryProps {
  assetId: string;
}

export default function AssetHistory({ assetId }: AssetHistoryProps) {
  const { getAssetChangelog } = useAssets();
  const history = getAssetChangelog(assetId);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Creado",
      updated: "Actualizado",
      relocated: "Reubicado",
      cost_updated: "Costo actualizado",
      status_changed: "Estado cambiado",
      decommissioned: "Desincorporado",
    };
    return labels[action] || action;
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      name: "Nombre",
      type: "Tipo",
      subtype: "Subtipo",
      description: "Descripción",
      serialNumber: "Serial",
      responsible: "Responsable",
      location: "Ubicación",
      cost: "Costo",
      status: "Estado",
    };
    return labels[field] || field;
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No hay historial disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.reverse().map((entry) => (
        <Card key={entry.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{getActionLabel(entry.action)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    por {entry.username}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(entry.timestamp).toLocaleString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="space-y-1">
                  {entry.changes.map((change, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{getFieldLabel(change.field)}:</span>{" "}
                      <span className="text-muted-foreground line-through">
                        {change.oldValue || "N/A"}
                      </span>{" "}
                      → <span className="text-foreground font-medium">{change.newValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

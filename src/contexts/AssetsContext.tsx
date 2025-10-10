import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Asset, ChangelogEntry, AssetsContextType, AssetStatus } from "@/types";
import { useAuth } from "./AuthContext";

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

const STORAGE_KEY = "assets_inventory";
const CHANGELOG_KEY = "assets_changelog";

// Demo data
const DEMO_ASSETS: Asset[] = [
  {
    id: "1",
    name: "Laptop Dell XPS 15",
    type: "Hardware",
    subtype: "Computadora",
    description: "Laptop de desarrollo",
    serialNumber: "DLL-2024-001",
    responsible: "Juan Pérez",
    location: "Oficina Principal - Piso 3",
    cost: 1500,
    status: "active",
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 0, 15).toISOString(),
    createdBy: "admin",
  },
  {
    id: "2",
    name: "Licencia Microsoft Office 365",
    type: "Software",
    subtype: "Licencia",
    description: "Suite de productividad",
    serialNumber: "MS-365-2024",
    responsible: "María García",
    location: "Digital",
    cost: 99,
    status: "active",
    createdAt: new Date(2024, 1, 1).toISOString(),
    updatedAt: new Date(2024, 1, 1).toISOString(),
    createdBy: "admin",
  },
];

export function AssetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedChangelog = localStorage.getItem(CHANGELOG_KEY);
    
    if (stored) {
      setAssets(JSON.parse(stored));
    } else {
      setAssets(DEMO_ASSETS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ASSETS));
    }

    if (storedChangelog) {
      setChangelog(JSON.parse(storedChangelog));
    }
  }, []);

  const saveAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
  };

  const addChangelogEntry = (entry: Omit<ChangelogEntry, "id" | "timestamp" | "userId" | "username">) => {
    if (!user) return;

    const newEntry: ChangelogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.username,
    };

    const newChangelog = [...changelog, newEntry];
    setChangelog(newChangelog);
    localStorage.setItem(CHANGELOG_KEY, JSON.stringify(newChangelog));
  };

  const addAsset = (assetData: Omit<Asset, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
    if (!user) return;

    const newAsset: Asset = {
      ...assetData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.username,
    };

    saveAssets([...assets, newAsset]);
    addChangelogEntry({
      assetId: newAsset.id,
      action: "created",
      changes: [
        { field: "asset", oldValue: "", newValue: newAsset.name },
      ],
    });
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    const changes: ChangelogEntry["changes"] = [];
    Object.entries(updates).forEach(([key, value]) => {
      if (asset[key as keyof Asset] !== value) {
        changes.push({
          field: key,
          oldValue: String(asset[key as keyof Asset]),
          newValue: String(value),
        });
      }
    });

    const updatedAssets = assets.map((a) =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );

    saveAssets(updatedAssets);
    if (changes.length > 0) {
      addChangelogEntry({
        assetId: id,
        action: "updated",
        changes,
      });
    }
  };

  const deleteAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    saveAssets(assets.filter((a) => a.id !== id));
    addChangelogEntry({
      assetId: id,
      action: "decommissioned",
      changes: [
        { field: "status", oldValue: asset.status, newValue: "deleted" },
      ],
    });
  };

  const relocateAsset = (id: string, location: string, responsible: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    const changes: ChangelogEntry["changes"] = [];
    if (asset.location !== location) {
      changes.push({ field: "location", oldValue: asset.location, newValue: location });
    }
    if (asset.responsible !== responsible) {
      changes.push({ field: "responsible", oldValue: asset.responsible, newValue: responsible });
    }

    updateAsset(id, { location, responsible });
    if (changes.length > 0) {
      addChangelogEntry({
        assetId: id,
        action: "relocated",
        changes,
      });
    }
  };

  const updateCost = (id: string, cost: number) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    updateAsset(id, { cost });
    addChangelogEntry({
      assetId: id,
      action: "cost_updated",
      changes: [
        { field: "cost", oldValue: asset.cost, newValue: cost },
      ],
    });
  };

  const changeStatus = (id: string, status: AssetStatus) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    updateAsset(id, { status });
    addChangelogEntry({
      assetId: id,
      action: "status_changed",
      changes: [
        { field: "status", oldValue: asset.status, newValue: status },
      ],
    });
  };

  const getAssetChangelog = (assetId: string) => {
    return changelog.filter((entry) => entry.assetId === assetId);
  };

  return (
    <AssetsContext.Provider
      value={{
        assets,
        changelog,
        addAsset,
        updateAsset,
        deleteAsset,
        relocateAsset,
        updateCost,
        changeStatus,
        getAssetChangelog,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error("useAssets must be used within AssetsProvider");
  }
  return context;
}

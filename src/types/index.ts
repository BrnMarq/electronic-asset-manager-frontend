export type UserRole = "admin" | "manager" | "inventory";

export type AssetStatus = "active" | "inactive" | "decommissioned";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AssetType {
  id: string;
  name: string;
  category: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  description?: string;
  serialNumber?: string;
  responsible: string;
  location: string;
  cost: number;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ChangelogEntry {
  id: string;
  assetId: string;
  action: "created" | "updated" | "relocated" | "cost_updated" | "status_changed" | "decommissioned";
  changes: {
    field: string;
    oldValue: string | number;
    newValue: string | number;
  }[];
  userId: string;
  username: string;
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface AssetsContextType {
  assets: Asset[];
  changelog: ChangelogEntry[];
  addAsset: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt" | "createdBy">) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  relocateAsset: (id: string, location: string, responsible: string) => void;
  updateCost: (id: string, cost: number) => void;
  changeStatus: (id: string, status: AssetStatus) => void;
  getAssetChangelog: (assetId: string) => ChangelogEntry[];
}

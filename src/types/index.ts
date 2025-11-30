export type UserRole = "admin" | "manager" | "inventory";

export type AssetStatus = "active" | "inactive" | "decommissioned";

export interface User {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: UserRole;
	createdAt: string;
}

export interface UserForm {
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: UserRole;
	password: string;
}

export interface AssetType {
	id: number;
	name: string;
	category: string;
	description?: string;
}

export interface Location {
	id: number;
	name: string;
	description?: string;
}

export interface AssetForm {
	id: number;
	name: string;
	type_id: number;
	description?: string;
	serial_number: number;
	responsible_id: number;
	location_id: number;
	cost: number;
	status: AssetStatus;
	acquisition_date: string; // ISO date string
	created_at: string;
	created_by: number;
}

export interface AssetFilter {
	name?: string;
	serial_number?: number;
	type_id?: number;
	description?: string;
	location_id?: number;
	status?: AssetStatus;
	responsible_id?: number;
	page?: number;
	limit?: number;
	cost?: number;
}

export interface Asset {
	id: number;
	name: string;
	serial_number: number;
	type_id: number;
	description: string | null;
	responsible_id: number;
	location_id: number;
	status: AssetStatus;
	cost: number;
	acquisition_date: string;
	created_by: number;
	location: {
		id: number;
		name: string;
	};
	type: {
		id: number;
		name: string;
	};
	responsible: {
		id: number;
		first_name: string;
		last_name: string;
	};
}

export interface AssetInfo {
	assets: Asset[];
	total: number;
}

export interface ChangelogEntry {
	id: string;
	assetId: string;
	action:
		| "created"
		| "updated"
		| "relocated"
		| "cost_updated"
		| "status_changed"
		| "decommissioned";
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
	assetsInfo: AssetInfo;
	fetchAssets: (page?: number, limit?: number, filters?: AssetFilter) => void;
	addAsset: (
		asset: Omit<
			AssetForm,
			"id" | "created_at" | "created_by" | "acquisition_date"
		>
	) => void;
	updateAsset: (id: number, updates: Partial<AssetForm>) => void;
	deleteAsset: (id: number) => void;
}

export interface LocationsContextType {
	locations: Location[];
	fetchLocations: () => void;
	addLocation: (location: Omit<Location, "id">) => void;
	updateLocation: (id: number, updates: Partial<Location>) => void;
	deleteLocation: (id: number) => void;
}

export interface TypesContextType {
	types: AssetType[];
	fetchTypes: () => void;
	addType: (type: Omit<AssetType, "id">) => void;
	updateType: (id: number, updates: Partial<AssetType>) => void;
	deleteType: (id: number) => void;
}

export interface UsersContextType {
	users: User[];
	fetchUsers: () => void;
	addUser: (user: Omit<User, "id" | "createdAt">) => void;
	updateUser: (
		id: number,
		updates: Partial<Omit<User, "id" | "createdAt">>
	) => void;
	deleteUser: (id: number) => void;
}

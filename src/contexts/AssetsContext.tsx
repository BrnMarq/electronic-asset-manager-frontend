import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import {
	AssetInfo,
	AssetForm,
	AssetsContextType,
	Location,
	AssetType,
	User,
} from "@/types";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [assetsInfo, setAssetsInfo] = useState<AssetInfo>({
		assets: [],
		total: 0,
	});
	const [locations, setLocations] = useState<Location[]>([]);
	const [types, setTypes] = useState<AssetType[]>([]);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		fetchCreateInfo();
	}, []);

	const fetchCreateInfo = async () => {
		try {
			const response = await api.get("/assets/create-info");
			setLocations(response.data.locations);
			setTypes(response.data.types);
			setUsers(response.data.users);
		} catch (error) {
			console.error("Error fetching assets:", error);
		}
	};

	const fetchAssets = async (page = 1, limit = 10) => {
		try {
			const response = await api.get("/assets", {
				params: {
					page,
					limit,
				},
			});
			setAssetsInfo(response.data);
		} catch (error) {
			console.error("Error fetching assets:", error);
		}
	};

	const addAsset = async (
		assetData: Omit<
			AssetForm,
			"id" | "created_at" | "created_by" | "acquisition_date"
		>
	) => {
		if (!user) return;
		const response = await api.post("/assets", assetData);
		setAssetsInfo({
			assets: [...assetsInfo.assets, response.data],
			total: assetsInfo.total + 1,
		});
	};

	const updateAsset = async (id: number, updates: Partial<AssetForm>) => {
		if (!user) return;
		const response = await api.patch(`/assets/${id}`, updates);
		console.log(response);
	};

	const deleteAsset = async (id: number) => {
		if (!user) return;
		const response = await api.delete(`/assets/${id}`);
		if (response.status === 200)
			setAssetsInfo({
				assets: assetsInfo.assets.filter((asset) => asset.id !== id),
				total: assetsInfo.total - 1,
			});
	};

	return (
		<AssetsContext.Provider
			value={{
				assetsInfo,
				locations,
				types,
				users,
				fetchAssets,
				fetchCreateInfo,
				addAsset,
				updateAsset,
				deleteAsset,
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

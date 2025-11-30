import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import { AssetInfo, AssetForm, AssetsContextType } from "@/types";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [assetsInfo, setAssetsInfo] = useState<AssetInfo>({
		assets: [],
		total: 0,
	});

	const fetchAssets = useCallback(
		async (page = 1, limit = 10, filters = {}) => {
			try {
				const response = await api.get("/assets", {
					params: {
						page,
						limit,
						...filters,
					},
				});
				setAssetsInfo(response.data);
			} catch (error) {
				console.error("Error fetching assets:", error);
			}
		},
		[]
	);

	const addAsset = async (
		assetData: Omit<
			AssetForm,
			"id" | "created_at" | "created_by" | "acquisition_date"
		>
	) => {
		if (!user) return;
		const response = await api.post("/assets", {
			...assetData,
			acquisition_date: new Date().toISOString(),
		});
		if (response.status === 201)
			setAssetsInfo({
				assets: [response.data, ...assetsInfo.assets],
				total: assetsInfo.total + 1,
			});
	};

	const updateAsset = async (id: number, updates: Partial<AssetForm>) => {
		if (!user) return;
		const response = await api.patch(`/assets/${id}`, updates);
		if (response.status === 200)
			setAssetsInfo({
				assets: assetsInfo.assets.map((asset) =>
					asset.id === id ? response.data.asset : asset
				),
				total: assetsInfo.total,
			});
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
				fetchAssets,
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

import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import { AssetType, TypesContextType } from "@/types";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const TypesContext = createContext<TypesContextType | undefined>(undefined);

export function TypesProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [types, setTypes] = useState<AssetType[]>([]);

	const fetchTypes = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/types");
			setTypes(response.data);
		} catch (error) {
			console.error("Error fetching types:", error);
		}
	}, [user]);

	const addType = async (type: Omit<AssetType, "id">) => {
		if (!user) return;
		try {
			const response = await api.post("/types", type);
			setTypes((prevTypes) => [...prevTypes, response.data]);
		} catch (error) {
			console.error("Error adding type:", error);
		}
	};

	const updateType = async (id: number, updates: Partial<AssetType>) => {
		if (!user) return;
		try {
			const response = await api.patch(`/types/${id}`, updates);
			setTypes((prevTypes) =>
				prevTypes.map((type) => (type.id === id ? response.data : type))
			);
		} catch (error) {
			console.error("Error updating type:", error);
		}
	};

	const deleteType = async (id: number) => {
		if (!user) return;
		try {
			await api.delete(`/types/${id}`);
			setTypes((prevTypes) => prevTypes.filter((type) => type.id !== id));
		} catch (error: any) {
			console.error("Error deleting location:", error);
			return { 
				success: false, 
				message: error.response?.data?.message || "Error al eliminar la ubicación" 
			};
		}
	};

	return (
		<TypesContext.Provider
			value={{
				types,
				fetchTypes,
				addType,
				updateType,
				deleteType,
			}}
		>
			{children}
		</TypesContext.Provider>
	);
}

export function useTypes() {
	const context = useContext(TypesContext);
	if (!context) {
		throw new Error("useTypes must be used within TypesProvider");
	}
	return context;
}

import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import { Location, LocationsContextType } from "@/types";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const LocationsContext = createContext<LocationsContextType | undefined>(
	undefined
);

export function LocationsProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [locations, setLocations] = useState<Location[]>([]);

	const fetchLocations = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/locations");
			setLocations(response.data);
		} catch (error) {
			console.error("Error fetching locations:", error);
		}
	}, [user]);

	const addLocation = async (data: { name: string; description?: string }) => {
		if (!user) return;
		try {
			const response = await api.post("/locations", data);
			setLocations((prev) => [...prev, response.data]);
		} catch (error) {
			console.error("Error adding location:", error);
		}
	};

	const updateLocation = async (
		id: number,
		data: { name: string; description?: string }
	) => {
		if (!user) return;
		try {
			const response = await api.patch(`/locations/${id}`, data);
			setLocations((prev) =>
				prev.map((loc) => (loc.id === id ? response.data : loc))
			);
		} catch (error) {
			console.error("Error updating location:", error);
		}
	};

	const deleteLocation = async (id: number) => {
		if (!user) return { success: false, message: "No autenticado" };
		try {
			await api.delete(`/locations/${id}`);
			setLocations((prev) => prev.filter((loc) => loc.id !== id));
			return { success: true };
		} catch (error: any) {
			console.error("Error deleting location:", error);
			return { 
				success: false, 
				message: error.response?.data?.message || "Error al eliminar la ubicación" 
			};
		}
	};

	return (
		<LocationsContext.Provider
			value={{
				locations,
				fetchLocations,
				addLocation,
				updateLocation,
				deleteLocation,
			}}
		>
			{children}
		</LocationsContext.Provider>
	);
}

export function useLocations() {
	const context = useContext(LocationsContext);
	if (!context) {
		throw new Error("useLocations must be used within LocationsProvider");
	}
	return context;
}

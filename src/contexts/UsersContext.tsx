import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import { User, UserForm, UsersContextType } from "@/types";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const ROLE_MAP = {
	admin: 1,
	manager: 2,
	inventory: 3,
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);

	const fetchUsers = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/users");
			setUsers(response.data);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	}, [user]);

	const addUser = async (data: Omit<UserForm, "id" | "createdAt">) => {
		if (!user) return;
		try {
			const response = await api.post("/users", {
				...data,
				role_id: ROLE_MAP[data.role as keyof typeof ROLE_MAP],
			});
			setUsers((prev) => [...prev, response.data]);
		} catch (error) {
			console.error("Error adding user:", error);
		}
	};

	const updateUser = async (
		id: number,
		data: Partial<Omit<UserForm, "id" | "createdAt">>
	) => {
		if (!user) return;
		try {
			const response = await api.patch(`/users/${id}`, {
				...data,
				role_id: ROLE_MAP[data.role as keyof typeof ROLE_MAP],
			});
			setUsers((prev) =>
				prev.map((loc) => (loc.id === id ? response.data : loc))
			);
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	const deleteUser = async (id: number) => {
		if (!user) return { success: false, message: "No autenticado" };
		try {
			await api.delete(`/users/${id}`);
			setUsers((prev) => prev.filter((loc) => loc.id !== id));
			return { success: true };
		} catch (error: any) {
			console.error("Error deleting user:", error);
			return { 
				success: false, 
				message: error.response?.data?.message || "Error al eliminar el usuario" 
			};
		}
	};

	return (
		<UsersContext.Provider
			value={{
				users,
				fetchUsers,
				addUser,
				updateUser,
				deleteUser,
			}}
		>
			{children}
		</UsersContext.Provider>
	);
}

export function useUsers() {
	const context = useContext(UsersContext);
	if (!context) {
		throw new Error("useUsers must be used within UsersProvider");
	}
	return context;
}

import { useEffect, useState } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import { Asset, AssetForm, AssetStatus } from "@/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import AssetHistory from "./AssetHistory";

interface AssetDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset?: Asset;
}

export default function AssetDialog({
	open,
	onOpenChange,
	asset,
}: AssetDialogProps) {
	const {
		addAsset,
		updateAsset,
		deleteAsset,
		fetchCreateInfo,
		locations,
		types,
		users,
	} = useAssets();
	const [formData, setFormData] = useState<
		Omit<AssetForm, "id" | "created_at" | "created_by" | "acquisition_date">
	>({
		name: "",
		type_id: 0,
		description: "",
		serial_number: 0,
		responsible_id: 0,
		location_id: 0,
		cost: 0,
		status: "active" as AssetStatus,
	});

	useEffect(() => {
		if (
			open &&
			locations.length === 0 &&
			types.length === 0 &&
			users.length === 0
		) {
			fetchCreateInfo();
		}
	}, [fetchCreateInfo, open, locations.length, types.length, users.length]);

	useEffect(() => {
		if (asset) {
			setFormData({
				name: asset.name,
				type_id: asset.type_id,
				description: asset.description || "",
				serial_number: asset.serial_number || 0,
				responsible_id: asset.responsible_id,
				location_id: asset.location_id,
				cost: asset.cost,
				status: asset.status,
			});
			return;
		}

		setFormData({
			name: "",
			type_id: 0,
			description: "",
			serial_number: 0,
			responsible_id: 0,
			location_id: 0,
			cost: 0,
			status: "active" as AssetStatus,
		});
	}, [asset, open]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (asset) {
			updateAsset(asset.id, formData);
			toast({
				title: "Activo actualizado",
				description: "Los cambios se guardaron correctamente",
			});
			return;
		}

		addAsset(formData);
		toast({
			title: "Activo creado",
			description: "El activo se agregó al inventario",
		});

		onOpenChange(false);
	};

	const handleDelete = () => {
		if (asset && confirm("¿Estás seguro de eliminar este activo?")) {
			deleteAsset(asset.id);
			toast({
				title: "Activo eliminado",
				description: "El activo fue removido del inventario",
			});
			onOpenChange(false);
		}
	};

	const handleStatusChange = (status: AssetStatus) => {
		if (asset) {
			setFormData({ ...formData, status });
			toast({
				title: "Estado actualizado",
				description: `El activo ahora está ${status}`,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{asset ? "Editar Activo" : "Nuevo Activo"}</DialogTitle>
					<DialogDescription>
						{asset
							? "Modifica la información del activo"
							: "Completa el formulario para agregar un nuevo activo"}
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue='info' className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='info'>Información</TabsTrigger>
						{asset && <TabsTrigger value='history'>Historial</TabsTrigger>}
					</TabsList>

					<TabsContent value='info'>
						<form onSubmit={handleSubmit} className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Nombre *</Label>
									<Input
										id='name'
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='type'>Tipo *</Label>
									<Select
										value={String(formData.type_id)}
										onValueChange={(value) =>
											setFormData({ ...formData, type_id: parseInt(value, 10) })
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder='Seleccionar tipo' />
										</SelectTrigger>
										<SelectContent>
											{types.map((type) => (
												<SelectItem key={type.id} value={String(type.id)}>
													{type.name} ({type.category})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='serial_number'>Número de Serie</Label>
									<Input
										id='serial_number'
										value={formData.serial_number}
										onChange={(e) => {
											const value = parseInt(e.target.value, 10);
											if (!isNaN(value)) {
												setFormData({ ...formData, serial_number: value });
											}
										}}
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Descripción</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={3}
								/>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='responsible'>Responsable *</Label>
									<Select
										value={String(formData.responsible_id)}
										onValueChange={(value) =>
											setFormData({
												...formData,
												responsible_id: parseInt(value, 10),
											})
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder='Seleccionar responsable' />
										</SelectTrigger>
										<SelectContent>
											{users.map((user) => (
												<SelectItem key={user.id} value={String(user.id)}>
													{user.username}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='location'>Ubicación *</Label>
									<Select
										value={String(formData.location_id)}
										onValueChange={(value) =>
											setFormData({
												...formData,
												location_id: parseInt(value, 10),
											})
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder='Seleccionar responsable' />
										</SelectTrigger>
										<SelectContent>
											{locations.map((location) => (
												<SelectItem
													key={location.id}
													value={String(location.id)}
												>
													{location.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='cost'>Costo *</Label>
									<Input
										id='cost'
										type='number'
										min='0'
										step='0.01'
										value={formData.cost}
										onChange={(e) =>
											setFormData({
												...formData,
												cost: parseFloat(e.target.value) || 0,
											})
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='status'>Estado *</Label>
									<Select
										value={formData.status}
										onValueChange={(value: AssetStatus) =>
											asset
												? handleStatusChange(value)
												: setFormData({ ...formData, status: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='active'>Activo</SelectItem>
											<SelectItem value='inactive'>Inactivo</SelectItem>
											<SelectItem value='decommissioned'>
												Desincorporado
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<DialogFooter className='flex justify-between'>
								<div>
									{asset && (
										<Button
											type='button'
											variant='destructive'
											onClick={handleDelete}
										>
											<Trash2 className='h-4 w-4 mr-2' />
											Eliminar
										</Button>
									)}
								</div>
								<div className='flex gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => onOpenChange(false)}
									>
										Cancelar
									</Button>
									<Button type='submit'>
										{asset ? "Guardar Cambios" : "Crear Activo"}
									</Button>
								</div>
							</DialogFooter>
						</form>
					</TabsContent>

					{asset && (
						<TabsContent value='history'>
							<AssetHistory assetId={String(asset.id)} />
						</TabsContent>
					)}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

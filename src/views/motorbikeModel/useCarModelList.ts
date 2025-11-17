import { useCallback, useEffect, useState } from "react";
import {
  getCarModelsForManage,
  createCarModel,
  updateCarModel,
  deleteCarModel,
} from "@/service/business/carMng/carModelMng.service";
import {
  CarModelDTO,
  CarModelSaveDTO,
} from "@/service/business/carMng/carModelMng.type";

export function useCarModelList() {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<CarModelDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCarModelsForManage();
      setModels(res.data || []);
    } catch (err: any) {
      setError("Không thể tải danh sách mẫu xe");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleCreate = async (data: CarModelSaveDTO) => {
    setLoading(true);
    try {
      await createCarModel(data);
      await fetchModels();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: CarModelSaveDTO) => {
    setLoading(true);
    try {
      await updateCarModel(id, data);
      await fetchModels();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteCarModel(id);
      await fetchModels();
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    models,
    error,
    fetchModels,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}

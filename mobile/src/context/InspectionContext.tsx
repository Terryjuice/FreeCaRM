import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '../config/api';
import { Inspection, ImageAngle } from '../types';

interface InspectionContextData {
  currentInspection: Inspection | null;
  inspections: Inspection[];
  loading: boolean;
  createInspection: (data: any) => Promise<Inspection>;
  getInspections: () => Promise<void>;
  getInspectionById: (id: string) => Promise<Inspection>;
  updateInspection: (id: string, data: any) => Promise<void>;
  deleteInspection: (id: string) => Promise<void>;
  uploadImage: (inspectionId: string, imageUri: string, angle: ImageAngle) => Promise<void>;
  analyzeInspection: (inspectionId: string) => Promise<void>;
  setCurrentInspection: (inspection: Inspection | null) => void;
}

const InspectionContext = createContext<InspectionContextData>({} as InspectionContextData);

export const InspectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);

  const createInspection = async (data: any): Promise<Inspection> => {
    try {
      setLoading(true);
      const response = await api.post('/inspections', data);
      const inspection = response.data.inspection;
      setCurrentInspection(inspection);
      return inspection;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create inspection');
    } finally {
      setLoading(false);
    }
  };

  const getInspections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inspections');
      setInspections(response.data.inspections);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch inspections');
    } finally {
      setLoading(false);
    }
  };

  const getInspectionById = async (id: string): Promise<Inspection> => {
    try {
      setLoading(true);
      const response = await api.get(`/inspections/${id}`);
      return response.data.inspection;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch inspection');
    } finally {
      setLoading(false);
    }
  };

  const updateInspection = async (id: string, data: any) => {
    try {
      setLoading(true);
      const response = await api.put(`/inspections/${id}`, data);
      if (currentInspection?._id === id) {
        setCurrentInspection(response.data.inspection);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update inspection');
    } finally {
      setLoading(false);
    }
  };

  const deleteInspection = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/inspections/${id}`);
      setInspections(inspections.filter((i) => i._id !== id));
      if (currentInspection?._id === id) {
        setCurrentInspection(null);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete inspection');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (inspectionId: string, imageUri: string, angle: ImageAngle) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
      formData.append('angle', angle);

      await api.post(`/inspections/${inspectionId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const analyzeInspection = async (inspectionId: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/inspections/${inspectionId}/analyze`);
      setCurrentInspection(response.data.inspection);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to analyze inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InspectionContext.Provider
      value={{
        currentInspection,
        inspections,
        loading,
        createInspection,
        getInspections,
        getInspectionById,
        updateInspection,
        deleteInspection,
        uploadImage,
        analyzeInspection,
        setCurrentInspection,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within InspectionProvider');
  }
  return context;
};

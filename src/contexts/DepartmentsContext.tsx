    // src/contexts/DepartmentsContext.tsx
    import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
    import axios from 'axios';

    // Ensure this matches your Flask backend URL
    const API_BASE_URL = 'http://localhost:5000/api'; 

    // Create an Axios instance that always sends credentials (cookies)
    const axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    export interface Department { // IMPORTANT: Ensure 'export' is here
        id: number;
        name: string;
    }

    interface DepartmentsContextType {
        departments: Department[];
        loading: boolean;
        error: string | null;
        refreshDepartments: () => void; // Optional: to refetch departments if needed
    }

    const DepartmentsContext = createContext<DepartmentsContextType | undefined>(undefined);

    export const DepartmentsProvider = ({ children }: { children: ReactNode }) => {
        const [departments, setDepartments] = useState<Department[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const fetchDepartments = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
                // Use axiosInstance here
                const response = await axiosInstance.get<Department[]>('/departments'); 
                setDepartments(response.data);
            } catch (err: any) { // Type 'any' for error to access `response.data`
                console.error("Failed to fetch departments:", err);
                setError(err.response?.data?.message || "Failed to load departments. Please ensure the backend is running and department data is populated.");
            } finally {
                setLoading(false);
            }
        }, []); // useCallback with empty dependency array

        useEffect(() => {
            fetchDepartments();
        }, [fetchDepartments]); // Dependency on fetchDepartments

        const refreshDepartments = () => {
            fetchDepartments();
        };

        return (
            <DepartmentsContext.Provider value={{ departments, loading, error, refreshDepartments }}>
                {children}
            </DepartmentsContext.Provider>
        );
    };

    export const useDepartments = () => {
        const context = useContext(DepartmentsContext);
        if (context === undefined) {
            throw new Error('useDepartments must be used within a DepartmentsProvider');
        }
        return context;
    };

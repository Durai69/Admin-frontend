import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// IMPORTANT: WITH /api prefix here, as these routes are part of a blueprint
const API_BASE_URL = 'http://127.0.0.1:5000/api'; 

// Configure Axios instance to always send cookies
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface QuestionData {
  id: number;
  text: string;
  type: 'rating' | 'text' | 'multiple_choice';
  order: number;
  category: string;
  options?: { id: number; text: string; value: string | null }[];
}

export interface SurveyData {
  id: number;
  title: string;
  description: string;
  created_at: string;
  rated_dept_name: string;
  managing_dept_name: string;
  rated_department_id: number;
  managing_department_id: number;
  questions: QuestionData[];
}

export interface UserSubmission {
  id: number;
  survey_id: number;
  submitter_user_id: number;
  submitter_department_id: number;
  rated_department_id: number;
  submitted_at: string;
  overall_customer_rating: number;
  suggestions: string | null;
  submitter_department_name: string;
  rated_department_name: string;
}

interface OverallStats {
  totalSurveysSubmitted: number;
  averageOverallRating: number;
  latestSubmissions: {
    responseId: number;
    surveyTitle: string;
    ratedDepartmentName: string;
    overallRating: number;
    submittedBy: string;
    submittedAt: string;
  }[];
}

interface DepartmentMetric {
  department_id: number;
  department_name: string;
  average_rating: number;
  total_surveys: number;
}

interface SurveyContextType {
  surveys: SurveyData[];
  currentSurvey: SurveyData | null;
  userSubmissions: UserSubmission[];
  overallStats: OverallStats | null;
  departmentMetrics: DepartmentMetric[];
  fetchSurveys: () => Promise<void>;
  fetchSurveyById: (id: number) => Promise<SurveyData | null>;
  fetchUserSubmissions: () => Promise<void>;
  fetchOverallDashboardStats: () => Promise<void>;
  fetchDepartmentDashboardMetrics: () => Promise<void>;
  submitSurveyResponse: (payload: any) => Promise<boolean>;
  isLoadingSurveys: boolean;
  isLoadingSurveyForm: boolean;
  error: string | null;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<SurveyData | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetric[]>([]);

  const [isLoadingSurveys, setIsLoadingSurveys] = useState(true);
  const [isLoadingSurveyForm, setIsLoadingSurveyForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = useCallback(async () => {
    setIsLoadingSurveys(true);
    setError(null);
    try {
      const response = await axiosInstance.get<SurveyData[]>('/surveys'); 
      setSurveys(response.data);
    } catch (err: any) {
      console.error("Failed to fetch surveys:", err);
      setError(err.response?.data?.detail || "Failed to load surveys.");
    } finally {
      setIsLoadingSurveys(false);
    }
  }, []);

  const fetchSurveyById = useCallback(async (id: number): Promise<SurveyData | null> => {
    setIsLoadingSurveyForm(true);
    setError(null);
    try {
      const response = await axiosInstance.get<SurveyData>(`/surveys/${id}`);
      setCurrentSurvey(response.data);
      return response.data;
    } catch (err: any) {
      console.error(`Failed to fetch survey with ID ${id}:`, err);
      setError(err.response?.data?.detail || `Failed to load survey with ID ${id}.`);
      setCurrentSurvey(null);
      return null;
    } finally {
      setIsLoadingSurveyForm(false);
    }
  }, []);

  const fetchUserSubmissions = useCallback(async () => {
    setIsLoadingSurveys(true); 
    setError(null);
    try {
      const response = await axiosInstance.get<UserSubmission[]>('/user-submissions');
      setUserSubmissions(response.data);
    } catch (err: any) {
      console.error("Failed to fetch user submissions:", err);
      setError(err.response?.data?.detail || "Failed to load your past surveys.");
    } finally {
      setIsLoadingSurveys(false);
    }
  }, []);

  const fetchOverallDashboardStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get<OverallStats>('/dashboard/overall-stats');
      setOverallStats(response.data);
    } catch (err: any) {
      console.error("Failed to fetch overall dashboard stats:", err);
    }
  }, []);

  const fetchDepartmentDashboardMetrics = useCallback(async () => {
    try {
      const response = await axiosInstance.get<DepartmentMetric[]>('/dashboard/department-metrics');
      setDepartmentMetrics(response.data);
    } catch (err: any) {
      console.error("Failed to fetch department dashboard metrics:", err);
    }
  }, []);

  const submitSurveyResponse = async (payload: any): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/submit-survey', payload);
      toast({
        title: "Survey Submitted",
        description: (response.data as { message?: string })?.message || "Your survey has been submitted successfully!",
      });
      fetchUserSubmissions(); 
      fetchOverallDashboardStats();
      fetchDepartmentDashboardMetrics();
      return true;
    } catch (err: any) {
      console.error('Failed to submit survey response:', err);
      toast({
        title: "Submission Failed",
        description: err.response?.data?.detail || "There was an error submitting your survey.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchSurveys(); 
      fetchUserSubmissions();
    } else if (!isAuthLoading && !isAuthenticated) {
      setIsLoadingSurveys(false);
    }
  }, [isAuthenticated, isAuthLoading, fetchSurveys, fetchUserSubmissions]);


  return (
    <SurveyContext.Provider value={{ 
        surveys, 
        currentSurvey, 
        userSubmissions, 
        overallStats, 
        departmentMetrics, 
        fetchSurveys, 
        fetchSurveyById, 
        fetchUserSubmissions, 
        fetchOverallDashboardStats, 
        fetchDepartmentDashboardMetrics, 
        submitSurveyResponse, 
        isLoadingSurveys, 
        isLoadingSurveyForm,
        error 
    }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = (): SurveyContextType => {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};

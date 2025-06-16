import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">Welcome, {user?.name || 'Admin'} 👋</h1>
        <p className="text-lg text-gray-600">
          Manage departments, permissions, and view analytics in the admin panel.
        </p>
        <Button 
          className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          onClick={() => navigate('/admin/dashboard')}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Index;

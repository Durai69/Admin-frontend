    // src/main.tsx
    import { createRoot } from 'react-dom/client';
    import App from './App.tsx';
    import './index.css';
    import { DepartmentsProvider } from './contexts/DepartmentsContext'; // Import the DepartmentsProvider

    createRoot(document.getElementById('root')!).render(
      // Wrap your main App component with the DepartmentsProvider
      <DepartmentsProvider>
        <App />
      </DepartmentsProvider>
    );
    
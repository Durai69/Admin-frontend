
import { useState } from 'react';
import { surveyReports } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { FilterBar } from '@/components/survey-reports/FilterBar';
import { ReportsTable } from '@/components/survey-reports/ReportsTable';
import { DownloadOptions } from '@/components/survey-reports/DownloadOptions';
import { filterReports } from '@/components/survey-reports/filterUtils';

const SurveyReports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all-time');
  const { toast } = useToast();
  
  const filteredReports = filterReports(
    surveyReports, 
    searchQuery, 
    selectedDepartment, 
    selectedPeriod
  );
  
  const handleDownloadPDF = () => {
    toast({
      title: "Export initiated",
      description: "Your PDF report is being generated",
    });
  };
  
  const handleDownloadExcel = () => {
    toast({
      title: "Export initiated",
      description: "Your Excel report is being generated",
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Survey Reports</h1>
        <p className="text-muted-foreground">
          View and analyze department survey data
        </p>
      </div>
      
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      
      <ReportsTable reports={filteredReports} />
      
      <DownloadOptions
        onDownloadPDF={handleDownloadPDF}
        onDownloadExcel={handleDownloadExcel}
      />
    </div>
  );
};

export default SurveyReports;

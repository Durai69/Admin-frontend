
import { SurveyReport } from '@/types/survey';

export const filterReports = (
  reports: SurveyReport[],
  searchQuery: string, 
  selectedDepartment: string, 
  selectedPeriod: string
): SurveyReport[] => {
  return reports.filter((report) => {
    let matches = true;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      matches = matches && (
        report.fromDept.toLowerCase().includes(lowerQuery) ||
        report.toDept.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (selectedDepartment && selectedDepartment !== 'all') {
      matches = matches && (
        report.fromDept === selectedDepartment ||
        report.toDept === selectedDepartment
      );
    }
    
    if (selectedPeriod && selectedPeriod !== 'all-time') {
      const reportDate = new Date(report.date);
      const now = new Date();
      
      switch (selectedPeriod) {
        case 'last-week':
          const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
          matches = matches && reportDate >= oneWeekAgo;
          break;
        case 'last-month':
          const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
          matches = matches && reportDate >= oneMonthAgo;
          break;
        case 'last-3-months':
          const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
          matches = matches && reportDate >= threeMonthsAgo;
          break;
        case 'last-6-months':
          const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
          matches = matches && reportDate >= sixMonthsAgo;
          break;
      }
    }
    
    return matches;
  });
};


// Mock user data
export const users = [
  { id: '01', name: 'Ravi', number: '1508921', email: 'ravi@example.com', department: 'IT', role: 'Rep', status: 'Submitted' },
  { id: '02', name: 'Ajith', number: '1589298', email: 'ajith@example.com', department: 'Design Controls', role: 'Rep', status: 'Submitted' },
  { id: '03', name: 'Kamal', number: '1592103', email: 'kamal@example.com', department: 'Mktg IA', role: 'Rep', status: 'Submitted' },
  { id: '04', name: 'Guru', number: '1492822', email: 'guru@example.com', department: 'QA', role: 'Rep', status: 'Not Submitted' },
  { id: '05', name: 'Inba', number: '1527893', email: 'inba@example.com', department: 'SCM', role: 'Rep', status: 'Submitted' },
  { id: '06', name: 'Sanjay', number: '1590321', email: 'sanjay@example.com', department: 'HR', role: 'Rep', status: 'Submitted' },
];

// Department list
export const departments = [
  'Sales Department',
  'Marketing Department',
  'HR',
  'Planning',
  'TPM',
  'CSD',
  'Finance',
  'IT',
  'Design IA',
  'Design TA',
  'QA',
  'Mktg IA',
  'SCM',
  'Project Management',
];

// Survey reports data
export const surveyReports = [
  { id: '1', fromDept: 'IT', toDept: 'HR', avgRating: 79, date: '2025-01-12', remarks: 'Need improvement in response time' },
  { id: '2', fromDept: 'HR', toDept: 'IT', avgRating: 87, date: '2025-01-12', remarks: 'Good support' },
  { id: '3', fromDept: 'Sales Department', toDept: 'Marketing Department', avgRating: 92, date: '2025-01-15', remarks: 'Excellent collaboration' },
  { id: '4', fromDept: 'QA', toDept: 'CSD', avgRating: 68, date: '2025-01-20', remarks: 'Delayed responses' },
  { id: '5', fromDept: 'Finance', toDept: 'HR', avgRating: 85, date: '2025-01-22', remarks: 'Good coordination' },
  { id: '6', fromDept: 'Mktg IA', toDept: 'Sales Department', avgRating: 90, date: '2025-01-25', remarks: 'Great teamwork' },
  { id: '7', fromDept: 'Design IA', toDept: 'Design TA', avgRating: 76, date: '2025-02-01', remarks: 'Communication issues' },
];

// Customer focus action plan data
export const actionPlans = [
  { 
    id: '01', 
    surveyDate: '16.07.2025', 
    department: 'Sheet metal', 
    suggestion: 'Need more manpower', 
    actionPlanned: 'Will procure if needed', 
    responsibility: 'Mr.Krishnamoorthi', 
    targetDate: '01.09.2025', 
    status: 'Completed' 
  },
  { 
    id: '02', 
    surveyDate: '16.07.2025', 
    department: 'Machine Shop', 
    suggestion: 'Plug gauge required', 
    actionPlanned: 'Provided Pin (GO/NO-GO)', 
    responsibility: 'Mr.Gopinath', 
    targetDate: '01.09.2025', 
    status: 'Pending' 
  },
  { 
    id: '03', 
    surveyDate: '28.07.2025', 
    department: 'CSD', 
    suggestion: 'QA issue - Need support', 
    actionPlanned: 'QA will assist CSD team', 
    responsibility: 'Mr.Santhosh', 
    targetDate: '01.09.2025', 
    status: 'Completed' 
  },
];

// Department performance data for dashboard charts
export const departmentPerformance = [
  { name: 'Mktg IA', rating: 84 },
  { name: 'QA', rating: 82 },
  { name: 'Design Controls', rating: 73 },
  { name: 'Project Management', rating: 95 },
  { name: 'IT', rating: 90 },
  { name: 'TPM', rating: 85 },
  { name: 'SCM', rating: 87 },
  { name: 'HR', rating: 92 },
];

// Dashboard statistics
export const dashboardStats = {
  totalSurveysSubmitted: 14,
  belowThreshold: 5,
  surveysNotSubmitted: 3,
};

// Initialize permission matrix with all departments
export const initialPermissions = (() => {
  const matrix: Record<string, Record<string, boolean>> = {};
  
  // Initialize matrix with all departments
  departments.forEach(fromDept => {
    matrix[fromDept] = {};
    departments.forEach(toDept => {
      // By default, allow permissions except for self-rating
      matrix[fromDept][toDept] = fromDept !== toDept;
    });
  });
  
  return matrix;
})();

// Admin user for login
export const adminUser = {
  username: 'admin',
  password: 'password',
  name: 'Admin User',
  email: 'admin@lakshmilife.com',
  department: 'IT',
  role: 'System Administrator'
};

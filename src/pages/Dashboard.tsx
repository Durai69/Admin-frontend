import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardStats, departmentPerformance } from '@/lib/mock-data';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  // PieChart, // Removed PieChart import
  // Pie,     // Removed Pie import
  Cell, 
  // Legend   // Legend might still be useful if you use it elsewhere, but not for Pie chart now
} from 'recharts';

const Dashboard = () => {
  // Hardcoded User status data (as provided in your snippet)
  const activeUsers = 42;
  const inactiveUsers = 8;

  // Removed ratingDistribution and COLORS as Pie Chart is replaced
  // const ratingDistribution = [
  //   { name: 'Above 90%', value: departmentPerformance.filter(dept => dept.rating >= 90).length },
  //   { name: '80-90%', value: departmentPerformance.filter(dept => dept.rating >= 80 && dept.rating < 90).length },
  //   { name: 'Below 80%', value: departmentPerformance.filter(dept => dept.rating < 80).length },
  // ];
  // const COLORS = ['#10b981', '#6366f1', '#ef4444'];

  // Departments below 80% for alerts
  const lowRatingDepts = departmentPerformance.filter(dept => dept.rating < 80);

  // Function to determine bar color based on rating
  const getBarColor = (entry: any) => {
    return entry.rating < 80 ? '#ef4444' : '#a5b4fc';
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Admin Dashboard
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Surveys Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardStats.totalSurveysSubmitted}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Below 80% Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-insight-danger">
              {dashboardStats.belowThreshold}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Surveys Not Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-insight-warning">
              {dashboardStats.surveysNotSubmitted}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and User Status */}
      <div className="grid gap-4 md:grid-cols-2"> {/* This grid structure remains */}
        {/* Bar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Department Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    fontSize={12}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar 
                    dataKey="rating" 
                    fill="#a5b4fc"
                    stroke="#6366f1"
                    fillOpacity={0.9}
                  >
                    {departmentPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* User Status Card (Replaced Pie Chart) */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Active Users</h3>
                  <p className="text-sm text-green-600">Currently active in system</p>
                </div>
                <div className="text-3xl font-bold text-green-700">
                  {activeUsers}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Inactive Users</h3>
                  <p className="text-sm text-red-600">Not currently active</p>
                </div>
                <div className="text-3xl font-bold text-red-700">
                  {inactiveUsers}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  Total Users: <span className="font-semibold">{activeUsers + inactiveUsers}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-insight-danger">
            Alert: Departments Below 80% Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowRatingDepts.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {lowRatingDepts.map((dept) => (
                <li key={dept.name} className="text-gray-700">
                  <span className="font-medium">{dept.name}</span> - {dept.rating}% rating
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Needs Attention
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No departments currently below threshold.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Summary */}
      <div className="mt-6 bg-muted p-4 rounded-md">
        <h3 className="text-sm font-medium mb-2">Summary</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Total surveys submitted: {dashboardStats.totalSurveysSubmitted}</li>
          <li>Below 80% ratings: {dashboardStats.belowThreshold}</li>
          <li>Surveys not submitted: {dashboardStats.surveysNotSubmitted}</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

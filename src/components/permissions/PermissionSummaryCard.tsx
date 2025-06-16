
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PermissionSummaryCardProps {
  totalPermissions: number;
  allowedPermissions: number;
  restrictedPermissions: number;
  progressRate: number;
}

export const PermissionSummaryCard = ({
  totalPermissions,
  allowedPermissions,
  restrictedPermissions,
  progressRate,
}: PermissionSummaryCardProps) => {
  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Permission Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gray-100 p-3 rounded text-center">
            <div className="text-xs text-gray-600 mb-1">Total Permissions</div>
            <div className="text-lg font-bold">{totalPermissions}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-100 p-3 rounded text-center">
              <div className="text-green-800 text-xs font-medium mb-1">✓ Allowed</div>
              <div className="text-lg font-bold text-green-800">{allowedPermissions}</div>
            </div>
            <div className="bg-red-100 p-3 rounded text-center">
              <div className="text-red-800 text-xs font-medium mb-1">✕ Restricted</div>
              <div className="text-lg font-bold text-red-800">{restrictedPermissions}</div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span>Progress Rate</span>
            <span className="font-medium">{progressRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressRate}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

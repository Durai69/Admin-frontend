// src/components/permissions/BulkActionsCard.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the props interface for BulkActionsCard
interface BulkActionsCardProps {
  departments: string[]; // This prop is now correctly defined
  onAllowAll: (selectedDeptName: string) => void;
  onRevokeAll: (selectedDeptName: string) => void;
}

export const BulkActionsCard: React.FC<BulkActionsCardProps> = ({
  departments, // Destructure the departments prop
  onAllowAll,
  onRevokeAll,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="filter-department" className="text-sm font-medium">
            Filter by departments
          </label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger id="filter-department">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((deptName) => ( // Use the departments prop here
                <SelectItem key={deptName} value={deptName}>
                  {deptName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onAllowAll(selectedDepartment)}
            disabled={!selectedDepartment}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Allow all
          </Button>
          <Button
            onClick={() => onRevokeAll(selectedDepartment)}
            disabled={!selectedDepartment}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            Revoke all
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

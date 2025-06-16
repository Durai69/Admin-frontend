
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { SurveyReport } from '@/types/survey';

interface ReportsTableProps {
  reports: SurveyReport[];
}

export const ReportsTable = ({ reports }: ReportsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-insight-light-blue bg-opacity-30">
          <TableRow>
            <TableHead>From Dept.</TableHead>
            <TableHead>To Dept.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Avg%</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length > 0 ? (
            reports.map((report) => (
              <TableRow 
                key={report.id}
                className={report.avgRating < 80 ? 'bg-red-50' : ''}
              >
                <TableCell>{report.fromDept}</TableCell>
                <TableCell>{report.toDept}</TableCell>
                <TableCell>
                  {new Date(report.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <span 
                    className={`font-bold ${
                      report.avgRating < 80 ? 'text-red-500' : ''
                    }`}
                  >
                    {report.avgRating}%
                  </span>
                  {report.avgRating < 80 && (
                    <span className="ml-2 text-yellow-500">⚠️</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="link" className="text-insight-blue">
                    [View]
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No reports match your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

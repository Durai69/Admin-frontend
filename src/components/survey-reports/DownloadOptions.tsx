
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet } from 'lucide-react';

interface DownloadOptionsProps {
  onDownloadPDF: () => void;
  onDownloadExcel: () => void;
}

export const DownloadOptions = ({ 
  onDownloadPDF, 
  onDownloadExcel 
}: DownloadOptionsProps) => {
  return (
    <div className="pt-4">
      <h3 className="font-medium text-gray-700 mb-2">Download Options</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={onDownloadPDF}
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4 text-red-500" /> Download as PDF
        </Button>
        <Button
          variant="outline"
          onClick={onDownloadExcel}
          className="flex items-center"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-500" /> Download as Excel
        </Button>
      </div>
    </div>
  );
};

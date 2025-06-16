import { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, startOfQuarter, endOfQuarter } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Define the DateRange type to be consistent with ManagePermissions.tsx
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Define the props interface for DateRangePicker
interface DateRangePickerProps {
  onSelectDateRange: (range: DateRange) => void;
  selectedDateRange?: DateRange; // <--- NEW: Add selectedDateRange prop
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onSelectDateRange, selectedDateRange }) => {
  // Initialize internal state with the prop, or undefined if prop is not provided
  const [startDate, setStartDate] = useState<Date | undefined>(selectedDateRange?.from);
  const [endDate, setEndDate] = useState<Date | undefined>(selectedDateRange?.to);
  const [selectedOption, setSelectedOption] = useState<string>('custom');

  // Effect to synchronize internal state with the `selectedDateRange` prop
  // This ensures that when the parent (ManagePermissions) fetches dates from the backend
  // and updates `dateRange`, this component also updates its display.
  useEffect(() => {
    setStartDate(selectedDateRange?.from);
    setEndDate(selectedDateRange?.to);
    // If both dates are set, and they don't match any predefined option, keep 'custom'
    // Otherwise, you might want to try to match a predefined option, but 'custom' is safe.
    if (selectedDateRange?.from && selectedDateRange?.to) {
        setSelectedOption('custom');
    }
  }, [selectedDateRange]);


  // Effect to handle changes in selectedOption and update startDate/endDate
  useEffect(() => {
    const today = new Date();
    let newStartDate: Date | undefined;
    let newEndDate: Date | undefined;

    switch (selectedOption) {
      case 'this-month':
        newStartDate = startOfMonth(today);
        newEndDate = endOfMonth(today);
        break;
      case 'next-month':
        const nextMonth = addMonths(today, 1);
        newStartDate = startOfMonth(nextMonth);
        newEndDate = endOfMonth(nextMonth);
        break;
      case 'this-quarter':
        newStartDate = startOfQuarter(today);
        newEndDate = endOfQuarter(today);
        break;
      case 'custom':
        // For custom, dates are set by the user via popovers,
        // so we don't clear them here directly.
        // The dates will be propagated in the next useEffect.
        // We'll rely on the `selectedDateRange` prop to set initial custom dates.
        return; // Don't overwrite existing custom dates from prop
      default:
        newStartDate = undefined;
        newEndDate = undefined;
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, [selectedOption]);

  // Effect to propagate the selected date range to the parent component
  useEffect(() => {
    onSelectDateRange({ from: startDate, to: endDate });
  }, [startDate, endDate, onSelectDateRange]);

  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm font-medium">Assign Start and End Date</span>

      <Select value={selectedOption} onValueChange={setSelectedOption}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select from/to Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">Custom Date Range</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="next-month">Next Month</SelectItem>
          <SelectItem value="this-quarter">This Quarter</SelectItem>
        </SelectContent>
      </Select>

      {selectedOption === 'custom' && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"} {/* Added year */}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"} {/* Added year */}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
};

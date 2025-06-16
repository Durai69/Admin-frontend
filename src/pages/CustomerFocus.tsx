import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Download, Edit, Plus, Search, Trash2 } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { actionPlans } from '@/lib/mock-data';
import { useDepartments } from '@/contexts/DepartmentsContext';

interface ActionPlan {
  id: string;
  surveyDate: string;
  department: string;
  suggestion: string;
  actionPlanned: string;
  responsibility: string;
  targetDate: string;
  status: string;
}

interface ActionPlanFormValues {
  id?: string;
  surveyDate: Date;
  department: string;
  suggestion: string;
  actionPlanned: string;
  responsibility: string;
  targetDate: Date;
  status: string;
}

const CustomerFocus = () => {
  // State for filters and data
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [data, setData] = useState<ActionPlan[]>(actionPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionPlan | null>(null);
  const { departments } = useDepartments();
  
  // Form setup
  const form = useForm<ActionPlanFormValues>({
    defaultValues: {
      surveyDate: new Date(),
      department: '',
      suggestion: '',
      actionPlanned: '',
      responsibility: '',
      targetDate: new Date(),
      status: 'Pending',
    },
  });

  // Filter the data based on selected filters
  const filteredData = data.filter(item => {
    // Department filter
    if (selectedDepartment !== 'all' && item.department !== selectedDepartment) {
      return false;
    }
    
    // Status filter
    if (selectedStatus !== 'all' && item.status !== selectedStatus) {
      return false;
    }
    
    // Search query
    if (
      searchQuery && 
      !item.department.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !item.suggestion.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !item.responsibility.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Date range filter (simple string comparison for demo)
    if (startDate && new Date(item.surveyDate) < startDate) {
      return false;
    }
    
    if (endDate && new Date(item.surveyDate) > endDate) {
      return false;
    }
    
    return true;
  });

  // Handle form submission
  const onSubmit = (values: ActionPlanFormValues) => {
    if (editingItem) {
      // Update existing item
      setData(prevData => 
        prevData.map(item => 
          item.id === editingItem.id ? {
            ...item,
            surveyDate: format(values.surveyDate, 'dd.MM.yyyy'),
            department: values.department,
            suggestion: values.suggestion,
            actionPlanned: values.actionPlanned,
            responsibility: values.responsibility,
            targetDate: format(values.targetDate, 'dd.MM.yyyy'),
            status: values.status
          } : item
        )
      );
    } else {
      // Add new item
      const newItem: ActionPlan = {
        id: `0${data.length + 1}`,
        surveyDate: format(values.surveyDate, 'dd.MM.yyyy'),
        department: values.department,
        suggestion: values.suggestion,
        actionPlanned: values.actionPlanned,
        responsibility: values.responsibility,
        targetDate: format(values.targetDate, 'dd.MM.yyyy'),
        status: values.status
      };
      
      setData([...data, newItem]);
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
    form.reset();
  };

  // Handle edit button click
  const handleEdit = (item: ActionPlan) => {
    setEditingItem(item);
    form.reset({
      surveyDate: new Date(item.surveyDate.split('.').reverse().join('-')),
      department: item.department,
      suggestion: item.suggestion,
      actionPlanned: item.actionPlanned,
      responsibility: item.responsibility,
      targetDate: new Date(item.targetDate.split('.').reverse().join('-')),
      status: item.status
    });
    setIsDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({
      surveyDate: new Date(),
      department: '',
      suggestion: '',
      actionPlanned: '',
      responsibility: '',
      targetDate: new Date(),
      status: 'Pending',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Focus – ICS Survey Action Plan</h1>
        <p className="text-muted-foreground">
          Manage and track customer survey action plans
        </p>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Department Filter */}
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.toString()} value={dept.toString()}>{dept.toString()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Status Filter */}
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Date Range */}
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PP') : <span>Start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
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
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PP') : <span>End date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            <div className="flex justify-between items-center">
              <span>Total entries: {filteredData.length}</span>
              <div className="space-x-2">
                <Button onClick={handleAddNew} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Action
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">SL No</TableHead>
              <TableHead>Survey Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Suggestion/Problem</TableHead>
              <TableHead>Action Planned</TableHead>
              <TableHead>Responsibility</TableHead>
              <TableHead>Target Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.surveyDate}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.suggestion}</TableCell>
                  <TableCell>{item.actionPlanned}</TableCell>
                  <TableCell>{item.responsibility}</TableCell>
                  <TableCell>{item.targetDate}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        item.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      )}
                    >
                      {item.status === "Completed" ? "✅ Completed" : "⏳ Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Action Plan' : 'Add New Action Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the action plan details below.' : 'Fill in the details for the new action plan.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Survey Date */}
                <FormField
                  control={form.control}
                  name="surveyDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Survey Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                
                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.toString()} value={dept.toString()}>{dept.toString()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Suggestion */}
              <FormField
                control={form.control}
                name="suggestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggestion/Problem</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Action Planned */}
              <FormField
                control={form.control}
                name="actionPlanned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Planned</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Responsibility */}
                <FormField
                  control={form.control}
                  name="responsibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsibility</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Target Date */}
                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Target Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Add'} Action Plan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerFocus;

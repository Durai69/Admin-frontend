import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDepartments } from '@/contexts/DepartmentsContext'; // Now provides { id: number, name: string }[]
import axios from 'axios'; // Import axios for API calls

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  // department is stored as string in backend User model, so keep it string here
  department: string; 
  role: string;
  status: string;
}

// Assuming your Flask backend runs on port 5000
const API_BASE_URL = 'http://localhost:5000/api'; 

const ManageUsers = () => {
  // Use DepartmentsContext to get departments (now with id and name)
  const { departments, loading: departmentsLoading, error: departmentsError, refreshDepartments } = useDepartments(); 

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    // For department, we'll store the name, but map to ID for new department creation
    department: '', 
    role: 'User',
    password: '',
  });
  const [newDepartmentName, setNewDepartmentName] = useState(''); // For adding new department via modal
  const { toast } = useToast();
  const [loading, setLoading] = useState(false); // For user API operations
  const [error, setError] = useState<string | null>(null); // For user API operations

  // Helper to map department names to IDs for backend calls
  const getDepartmentIdByName = (name: string): number | undefined => {
    const dept = departments.find(d => d.name === name);
    return dept ? dept.id : undefined;
  };

  // --- Fetch Users from Backend ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Fetch users only after departments are loaded to ensure proper mapping if needed
    if (!departmentsLoading && !departmentsError) {
        fetchUsers();
    }
  }, [fetchUsers, departmentsLoading, departmentsError]);


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Add New Department (if selected in user form) ---
  const handleAddNewDepartment = async (deptName: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/departments`, { name: deptName });
      if (response.status === 201) { // Assuming 201 Created for new department
        toast({
          title: 'Department Added',
          description: `${deptName} has been added to departments`,
        });
        refreshDepartments(); // Refresh departments in context to get the new one
        return response.data.id; // Return the ID of the newly created department
      }
    } catch (err: any) {
      console.error("Failed to add new department:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add new department.",
        variant: "destructive",
      });
      throw err; // Re-throw to stop user creation if department fails
    }
  };

  // --- Add User ---
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.username || !newUser.password || !newUser.department) {
      toast({
        title: 'Validation Error',
        description: 'All fields (including username and password) are required.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);
    let finalDepartmentName = newUser.department;

    try {
      // Handle adding a new department if "new" is selected
      if (newUser.department === 'new' && newDepartmentName.trim()) {
        finalDepartmentName = newDepartmentName.trim();
        // Check if it already exists in the *fetched* departments
        const existingDept = departments.find(d => d.name.toLowerCase() === finalDepartmentName.toLowerCase());
        if (!existingDept) {
          await handleAddNewDepartment(finalDepartmentName); // Create new department via API
        } else {
            // If it exists but 'new' was selected, just use the existing one
            finalDepartmentName = existingDept.name;
        }
      } else if (newUser.department === 'new' && !newDepartmentName.trim()) {
          toast({
              title: 'Validation Error',
              description: 'Please enter a name for the new department.',
              variant: 'destructive',
          });
          setLoading(false);
          return;
      }

      // Proceed with adding the user
      const response = await axios.post(`${API_BASE_URL}/users`, {
        username: newUser.username,
        password: newUser.password,
        name: newUser.name,
        email: newUser.email,
        department: finalDepartmentName, // Send the department name string to backend
        role: newUser.role,
      });

      if (response.status === 201) { // Assuming 201 Created
        await fetchUsers(); // Re-fetch users to update the list
        setShowAddUserModal(false);
        resetForm();

        toast({
          title: 'User Added',
          description: `${newUser.name} has been added successfully`,
        });
      }
    } catch (err: any) {
      console.error("Failed to add user:", err);
      setError(err.response?.data?.message || "Failed to add user. Please try again.");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Update User ---
  const handleUpdateUser = async () => {
    if (!userToEdit) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userToEdit.id}`, {
        name: userToEdit.name,
        email: userToEdit.email,
        department: userToEdit.department, // Send the department name string to backend
        role: userToEdit.role,
      });

      if (response.status === 200) { // Assuming 200 OK
        await fetchUsers(); // Re-fetch users to update the list
        setUserToEdit(null);

        toast({
          title: 'User Updated',
          description: `${userToEdit.name}'s information has been updated`,
        });
      }
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(err.response?.data?.message || "Failed to update user. Please try again.");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Delete User ---
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userToDelete.id}`);

      if (response.status === 200) { // Assuming 200 OK
        await fetchUsers(); // Re-fetch users to update the list
        setUserToDelete(null);

        toast({
          title: 'User Deleted',
          description: `${userToDelete.name} has been removed`,
        });
      }
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      setError(err.response?.data?.message || "Failed to delete user. Please try again.");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      username: '',
      name: '',
      email: '',
      department: '',
      role: 'User',
      password: '',
    });
    setNewDepartmentName('');
  };

  // Display loading or error states for initial data fetch
  if (departmentsLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        <p>Loading departments...</p>
      </div>
    );
  }

  if (departmentsError) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-500">
        <p>Error loading departments: {departmentsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => { setShowAddUserModal(true); resetForm(); }} className="bg-insight-blue">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="flex w-full items-center space-x-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 opacity-50" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </div>

      {loading && users.length === 0 ? ( // Show loading only if no users are loaded yet
        <div className="text-center py-8">Loading users...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-insight-light-blue bg-opacity-30">
              <TableRow>
                <TableHead className="w-[80px]">S.no</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Submitted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserToEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4"> {/* Adjusted colspan */}
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username">
                Username:
              </Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password">
                Password:
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">
                Name:
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email">
                Email - ID:
              </Label>
              <Input
                id="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department">
                Department:
              </Label>
              <Select
                value={newUser.department}
                onValueChange={(value) => setNewUser({ ...newUser, department: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {/* Render departments from context */}
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}> {/* Use dept.name as value */}
                      {dept.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add New Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newUser.department === 'new' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newDepartment">
                  New Department:
                </Label>
                <Input
                  id="newDepartment"
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Enter new department name"
                  className="col-span-3"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role">
                Role:
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button onClick={handleAddUser} disabled={loading || departmentsLoading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {userToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username">
                  Username:
                </Label>
                <Input
                  id="edit-username"
                  value={userToEdit.username}
                  onChange={(e) => setUserToEdit({ ...userToEdit, username: e.target.value })}
                  className="col-span-3"
                  disabled // Username usually not editable after creation
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name">
                  Name:
                </Label>
                <Input
                  id="edit-name"
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email">
                  Email - ID:
                </Label>
                <Input
                  id="edit-email"
                  value={userToEdit.email}
                  onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department">
                  Department:
                </Label>
                <Select
                  value={userToEdit.department}
                  onValueChange={(value) => setUserToEdit({ ...userToEdit, department: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}> {/* Use dept.name as value */}
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role">
                  Role:
                </Label>
                <Select
                  value={userToEdit.role}
                  onValueChange={(value) => setUserToEdit({ ...userToEdit, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateUser} disabled={loading || departmentsLoading}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {userToDelete?.name}'s account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600"
              disabled={loading || departmentsLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUsers;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const handlePasswordChange = () => {
    // Reset errors
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    let hasErrors = false;
    
    // Simple validation
    if (!passwords.currentPassword) {
      setErrors((prev) => ({ ...prev, currentPassword: 'Current password is required' }));
      hasErrors = true;
    } else if (passwords.currentPassword !== 'password') {
      setErrors((prev) => ({ ...prev, currentPassword: 'Current password is incorrect' }));
      hasErrors = true;
    }
    
    if (!passwords.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      hasErrors = true;
    } else if (passwords.newPassword.length < 6) {
      setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 6 characters' }));
      hasErrors = true;
    }
    
    if (!passwords.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      hasErrors = true;
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    // Success case
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
    
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    setIsEditingPassword(false);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>
      
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-2 bg-gray-50 rounded-md">{user?.name}</div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-2 bg-gray-50 rounded-md">{user?.email}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <div className="p-2 bg-gray-50 rounded-md">{user?.department}</div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="p-2 bg-gray-50 rounded-md">{user?.role}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>
              <Button onClick={() => setIsEditingPassword(true)}>
                Change Password
              </Button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium mb-2">Login Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last login</span>
                  <span className="text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last password change</span>
                  <span className="text-sm">Never</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Password Change Dialog */}
      <Dialog open={isEditingPassword} onOpenChange={setIsEditingPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSettings;

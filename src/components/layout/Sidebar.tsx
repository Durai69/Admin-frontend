
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, 
  Users, 
  Settings, 
  FileText, 
  LogOut, 
  CheckSquare, 
  FileCode
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { logout } = useAuth();
  
  const navigationItems = [
    { name: 'Dashboard', to: '/', icon: BarChart },
    { name: 'Manage Users', to: '/users', icon: Users },
    { name: 'Manage Permissions', to: '/permissions', icon: Settings },
    { name: 'Survey Reports', to: '/reports', icon: FileText },
    { name: 'Customer Focus', to: '/customer-focus', icon: CheckSquare },
    { name: 'Account Settings', to: '/account', icon: FileCode },
  ];
  
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-30 w-64 bg-insight-blue text-white transition-transform duration-300 ease-in-out transform md:translate-x-0 md:relative md:z-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}

      > 
     {/* Logo */}
<div className="flex items-center justify-center h-16 border-b border-insight-blue/30">
  <div className="font-semibold text-xl flex items-center space-x-2">
    <img src={logo} alt="Logo" className="h-10 w-auto" />
  </div>
</div>
        {/* Menu Label */}
        <div className="px-4 py-2 text-sm font-medium text-insight-blue-50/70">
          MENU
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-white text-insight-blue"
                    : "text-white hover:bg-insight-blue/90"
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-insight-blue/90 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            LOG OUT
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

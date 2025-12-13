
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, PawPrint, Users, Flag, LogOut, Shield } from 'lucide-react';
export function AdminSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const menuItems = [{
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  }, {
    path: '/admin/shelters',
    icon: Building2,
    label: 'Verify Shelters'
  }, {
    path: '/admin/pets',
    icon: PawPrint,
    label: 'All Pets'
  }, {
    path: '/admin/users',
    icon: Users,
    label: 'Users'
  }, {
    path: '/admin/moderation',
    icon: Flag,
    label: 'Moderation'
  }];
  return <aside className="w-64 min-h-screen p-6 border-r" style={{
    background: 'var(--color-card)',
    borderColor: 'var(--color-border)'
  }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="p-2 rounded-xl" style={{
        background: 'var(--color-error)'
      }}>
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold block" style={{
          color: 'var(--color-text)'
        }}>
            PetMate
          </span>
          <span className="text-xs" style={{
          color: 'var(--color-text-light)'
        }}>
            Admin Portal
          </span>
        </div>
      </Link>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map(item => <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{
        background: isActive(item.path) ? 'var(--color-error)' : 'transparent',
        color: isActive(item.path) ? 'white' : 'var(--color-text)',
        opacity: isActive(item.path) ? 1 : 0.7
      }}>
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>)}
      </nav>

      {/* Logout */}
      <button className="flex items-center gap-3 px-4 py-3 rounded-xl mt-auto w-full transition-all hover:bg-red-50" style={{
      color: 'var(--color-error)',
      marginTop: 'auto'
    }}>
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </aside>;
}
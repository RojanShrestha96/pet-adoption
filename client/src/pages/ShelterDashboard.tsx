import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PawPrint, FileText, Users, TrendingUp, ArrowRight, Plus,
  Grid3X3, List, Eye, CheckCircle, XCircle, Clock, Calendar,
  Dog, Cat, Heart, Activity, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShelterSidebar } from '../components/ShelterSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NotificationCenter } from '../components/NotificationCenter';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { useAuth } from '../contexts/AuthContext';

interface Application {
  _id: string;
  petName: string;
  petImage?: string;
  petSpecies: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  scheduledDate?: string;
  createdAt: string;
}

interface PetStats {
  available: number;
  pending: number;
  adopted: number;
  pendingReview: number;
}

export function ShelterDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [shelterData, setShelterData] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [petStats, setPetStats] = useState<PetStats>({ available: 0, pending: 0, adopted: 0, pendingReview: 0 });
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch shelter info
        const shelterResponse = await fetch('http://localhost:5000/api/shelter/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (shelterResponse.ok) {
          const data = await shelterResponse.json();
          setShelterData(data);
        }

        // Fetch recent applications (mock for now, can integrate with real API)
        // TODO: Replace with actual API call when endpoint is ready
        setApplications([
          {
            _id: '1',
            petName: 'Luna',
            petImage: '',
            petSpecies: 'dog',
            applicantName: 'Sarah Johnson',
            applicantEmail: 'sarah@email.com',
            status: 'pending',
            scheduledDate: '2024-12-15',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '2',
            petName: 'Max',
            petImage: '',
            petSpecies: 'dog',
            applicantName: 'Mike Smith',
            applicantEmail: 'mike@email.com',
            status: 'reviewing',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '3',
            petName: 'Whiskers',
            petImage: '',
            petSpecies: 'cat',
            applicantName: 'Emily Davis',
            applicantEmail: 'emily@email.com',
            status: 'approved',
            scheduledDate: '2024-12-18',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '4',
            petName: 'Bella',
            petImage: '',
            petSpecies: 'cat',
            applicantName: 'John Wilson',
            applicantEmail: 'john@email.com',
            status: 'pending',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '5',
            petName: 'Rocky',
            petImage: '',
            petSpecies: 'dog',
            applicantName: 'Anna Brown',
            applicantEmail: 'anna@email.com',
            status: 'rejected',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '6',
            petName: 'Milo',
            petImage: '',
            petSpecies: 'cat',
            applicantName: 'Chris Lee',
            applicantEmail: 'chris@email.com',
            status: 'reviewing',
            scheduledDate: '2024-12-20',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ]);

        // Mock pet stats
        setPetStats({
          available: 12,
          pending: 5,
          adopted: 28,
          pendingReview: 3
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const stats = [
    {
      label: 'Total Pets',
      value: shelterData?.stats?.totalPets || 0,
      icon: PawPrint,
      trend: '+12%',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      label: 'Applications',
      value: shelterData?.stats?.applications || applications.length,
      icon: FileText,
      trend: '+5%',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Adoptions',
      value: shelterData?.stats?.adoptions || petStats.adopted,
      icon: Heart,
      trend: '+18%',
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Profile Views',
      value: shelterData?.stats?.views || '1.2k',
      icon: TrendingUp,
      trend: '+24%',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
      pending: { variant: 'warning', label: 'Pending' },
      reviewing: { variant: 'info', label: 'Reviewing' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'neutral', label: 'Rejected' }
    };
    return configs[status] || configs.pending;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <ShelterSidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" label="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <HamburgerMenu />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Welcome back, manage your shelter</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/shelter/add-pet">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                <span className="hidden sm:inline">Add Pet</span>
              </Button>
            </Link>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <NotificationCenter />
            
            {/* Profile */}
            <div className="relative group">
              <button className="flex items-center gap-2 sm:gap-3 pl-2 py-1 pr-1 hover:bg-gray-50 rounded-full transition-colors">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{shelterData?.contactPerson || shelterData?.name || 'Shelter Admin'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Shelter Manager</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20 overflow-hidden">
                  {shelterData?.logo ? (
                    <img src={shelterData.logo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {(shelterData?.name || user?.name || 'S')
                        .split(' ')
                        .map((w: any) => w[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
              </button>
              
              <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                  <Link to="/shelter/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link to="/login" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Log Out</Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Compact Welcome Banner */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Welcome back, {shelterData?.name || 'Partner'}! 👋
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {applications.filter(a => a.status === 'pending').length} pending applications • {petStats.pendingReview} pets awaiting review
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <PawPrint className="w-48 h-48" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Applications Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                  <p className="text-sm text-gray-500">Showing {applications.length} applications</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white shadow-sm text-[var(--color-primary)]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'list'
                          ? 'bg-white shadow-sm text-[var(--color-primary)]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <Link
                    to="/shelter/applications"
                    className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {applications.map((app, index) => {
                      const statusConfig = getStatusConfig(app.status);
                      return (
                        <motion.div
                          key={app._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="p-4 hover:shadow-md transition-all group">
                            {/* Pet Info */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                app.petSpecies === 'dog' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
                              }`}>
                                {app.petSpecies === 'dog' ? <Dog className="w-5 h-5" /> : <Cat className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{app.petName}</h4>
                                <p className="text-xs text-gray-500 capitalize">{app.petSpecies}</p>
                              </div>
                              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                            </div>

                            {/* Applicant Info */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 truncate">{app.applicantName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500">{formatTime(app.createdAt)}</span>
                              </div>
                              {app.scheduledDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-green-500" />
                                  <span className="text-green-600 font-medium">
                                    {new Date(app.scheduledDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                              <Link to={`/shelter/applications/${app._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full" icon={<Eye className="w-4 h-4" />}>
                                  View
                                </Button>
                              </Link>
                              {app.status === 'pending' && (
                                <>
                                  <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pet</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Submitted</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Scheduled</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {applications.map((app) => {
                              const statusConfig = getStatusConfig(app.status);
                              return (
                                <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        app.petSpecies === 'dog' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
                                      }`}>
                                        {app.petSpecies === 'dog' ? <Dog className="w-4 h-4" /> : <Cat className="w-4 h-4" />}
                                      </div>
                                      <span className="font-medium text-gray-900">{app.petName}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-gray-700">{app.applicantName}</span>
                                  </td>
                                  <td className="py-3 px-4 hidden sm:table-cell">
                                    <span className="text-gray-500 text-sm">{formatTime(app.createdAt)}</span>
                                  </td>
                                  <td className="py-3 px-4 hidden md:table-cell">
                                    {app.scheduledDate ? (
                                      <span className="text-green-600 text-sm font-medium">
                                        {new Date(app.scheduledDate).toLocaleDateString()}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">—</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Link to={`/shelter/applications/${app._id}`}>
                                        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors">
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      </Link>
                                      {app.status === 'pending' && (
                                        <>
                                          <button className="p-2 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors">
                                            <CheckCircle className="w-4 h-4" />
                                          </button>
                                          <button className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                                            <XCircle className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Section: Pets Overview + Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pets Overview */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Pets Overview</h3>
                  <Link to="/shelter/pets" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                    Manage <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs font-medium text-green-700">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{petStats.available}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-xs font-medium text-amber-700">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">{petStats.pending}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-xs font-medium text-blue-700">Adopted</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{petStats.adopted}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-xs font-medium text-purple-700">In Review</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{petStats.pendingReview}</p>
                  </div>
                </div>
              </Card>

              {/* Activity Timeline */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Recent Activity</h3>
                  <Activity className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { action: 'New application received', pet: 'Luna', time: '2h ago', type: 'application' },
                    { action: 'Pet approved by admin', pet: 'Max', time: '5h ago', type: 'success' },
                    { action: 'Document uploaded', pet: 'Bella', time: '1d ago', type: 'document' },
                    { action: 'Interview scheduled', pet: 'Whiskers', time: '2d ago', type: 'schedule' }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'application' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'success' ? 'bg-green-100 text-green-600' :
                        activity.type === 'document' ? 'bg-purple-100 text-purple-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {activity.type === 'application' ? <FileText className="w-4 h-4" /> :
                         activity.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                         activity.type === 'document' ? <FileText className="w-4 h-4" /> :
                         <Calendar className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">{activity.pet}</span> • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
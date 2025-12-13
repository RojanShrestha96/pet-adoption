import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, PawPrint, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
export function AdminDashboard() {
  const stats = [{
    title: 'Total Users',
    value: '1,234',
    icon: Users,
    trend: {
      value: '12%',
      isPositive: true
    },
    color: 'var(--color-primary)'
  }, {
    title: 'Active Shelters',
    value: '25',
    icon: Building2,
    trend: {
      value: '5%',
      isPositive: true
    },
    color: 'var(--color-secondary)'
  }, {
    title: 'Total Pets',
    value: '342',
    icon: PawPrint,
    trend: {
      value: '18%',
      isPositive: true
    },
    color: 'var(--color-accent)'
  }, {
    title: 'Successful Adoptions',
    value: '567',
    icon: CheckCircle,
    trend: {
      value: '22%',
      isPositive: true
    },
    color: 'var(--color-success)'
  }, {
    title: 'Pending Verifications',
    value: '8',
    icon: AlertTriangle,
    color: 'var(--color-warning)'
  }, {
    title: 'Platform Growth',
    value: '+45%',
    icon: TrendingUp,
    trend: {
      value: '15%',
      isPositive: true
    },
    color: 'var(--color-info)'
  }];
  const recentActivity = [{
    type: 'shelter',
    action: 'New shelter registered',
    name: 'Pokhara Animal Welfare',
    time: '5 min ago'
  }, {
    type: 'adoption',
    action: 'Adoption completed',
    name: 'Luna adopted by Rajesh Kumar',
    time: '1 hour ago'
  }, {
    type: 'user',
    action: 'New user registered',
    name: 'Sita Sharma',
    time: '2 hours ago'
  }, {
    type: 'flag',
    action: 'Content flagged',
    name: 'Suspicious listing reported',
    time: '3 hours ago'
  }];
  return <div className="flex min-h-screen" style={{
    background: 'var(--color-background)'
  }}>
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{
          color: 'var(--color-text)'
        }}>
            Admin Dashboard
          </h1>
          <p style={{
          color: 'var(--color-text-light)'
        }}>
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => <StatCard key={stat.title} {...stat} index={index} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card padding="lg">
            <h2 className="text-2xl font-bold mb-6" style={{
            color: 'var(--color-text)'
          }}>
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => <motion.div key={index} initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.3,
              delay: index * 0.05
            }} className="flex items-start gap-4 p-4 rounded-xl" style={{
              background: 'var(--color-surface)'
            }}>
                  <div className="p-2 rounded-lg" style={{
                background: activity.type === 'flag' ? 'var(--color-error)' : 'var(--color-primary)',
                opacity: 0.1
              }}>
                    {activity.type === 'shelter' && <Building2 className="w-5 h-5" style={{
                  color: 'var(--color-primary)'
                }} />}
                    {activity.type === 'adoption' && <CheckCircle className="w-5 h-5" style={{
                  color: 'var(--color-success)'
                }} />}
                    {activity.type === 'user' && <Users className="w-5 h-5" style={{
                  color: 'var(--color-secondary)'
                }} />}
                    {activity.type === 'flag' && <AlertTriangle className="w-5 h-5" style={{
                  color: 'var(--color-error)'
                }} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1" style={{
                  color: 'var(--color-text)'
                }}>
                      {activity.action}
                    </p>
                    <p className="text-sm mb-1" style={{
                  color: 'var(--color-text-light)'
                }}>
                      {activity.name}
                    </p>
                    <p className="text-xs" style={{
                  color: 'var(--color-text-light)'
                }}>
                      {activity.time}
                    </p>
                  </div>
                </motion.div>)}
            </div>
          </Card>

          {/* Platform Health */}
          <Card padding="lg">
            <h2 className="text-2xl font-bold mb-6" style={{
            color: 'var(--color-text)'
          }}>
              Platform Health
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{
                  color: 'var(--color-text)'
                }}>
                    User Engagement
                  </span>
                  <span className="text-sm font-bold" style={{
                  color: 'var(--color-success)'
                }}>
                    92%
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{
                background: 'var(--color-border)'
              }}>
                  <motion.div initial={{
                  width: 0
                }} animate={{
                  width: '92%'
                }} transition={{
                  duration: 1,
                  delay: 0.5
                }} className="h-full rounded-full" style={{
                  background: 'var(--color-success)'
                }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{
                  color: 'var(--color-text)'
                }}>
                    Adoption Success Rate
                  </span>
                  <span className="text-sm font-bold" style={{
                  color: 'var(--color-primary)'
                }}>
                    78%
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{
                background: 'var(--color-border)'
              }}>
                  <motion.div initial={{
                  width: 0
                }} animate={{
                  width: '78%'
                }} transition={{
                  duration: 1,
                  delay: 0.6
                }} className="h-full rounded-full" style={{
                  background: 'var(--color-primary)'
                }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{
                  color: 'var(--color-text)'
                }}>
                    Shelter Satisfaction
                  </span>
                  <span className="text-sm font-bold" style={{
                  color: 'var(--color-secondary)'
                }}>
                    85%
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{
                background: 'var(--color-border)'
              }}>
                  <motion.div initial={{
                  width: 0
                }} animate={{
                  width: '85%'
                }} transition={{
                  duration: 1,
                  delay: 0.7
                }} className="h-full rounded-full" style={{
                  background: 'var(--color-secondary)'
                }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>;
}
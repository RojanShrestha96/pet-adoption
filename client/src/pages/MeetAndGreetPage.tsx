import React, { useState } from 'react';

import { 
  Calendar as CalendarIcon, Clock, MapPin, User, Search, Filter, 
  ChevronLeft, ChevronRight, CheckCircle, Plus, MoreHorizontal 
} from 'lucide-react';
import { ShelterSidebar } from '../components/ShelterSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { NotificationCenter } from '../components/NotificationCenter';
import { MeetAndGreetModal, MeetAndGreetData } from '../components/MeetAndGreetModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../components/Toast';

interface MeetAndGreet {
  id: string;
  applicantName: string;
  applicantEmail: string;
  petName: string;
  petImage: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



import { useAuth } from '../contexts/AuthContext';

export function MeetAndGreetPage() {
  const { showToast } = useToast();
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetAndGreet | null>(null);
  const [shelterLocation, setShelterLocation] = useState<string>("");

  // Mock Data with initial state
  const [meetAndGreets, setMeetAndGreets] = useState<MeetAndGreet[]>([
    {
      id: '1',
      applicantName: 'Sarah Johnson',
      applicantEmail: 'sarah@email.com',
      petName: 'Luna',
      petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100',
      date: '2024-12-15',
      time: '10:00 AM',
      location: 'Loading...', // Will be updated
      status: 'scheduled',
      notes: 'First time dog owner'
    },
    {
      id: '2',
      applicantName: 'Mike Smith',
      applicantEmail: 'mike@email.com',
      petName: 'Max',
      petImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100',
      date: '2024-12-15',
      time: '2:30 PM',
      location: 'Loading...',
      status: 'scheduled'
    },
    {
      id: '3',
      applicantName: 'Emily Davis',
      applicantEmail: 'emily@email.com',
      petName: 'Whiskers',
      petImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100',
      date: '2024-12-18',
      time: '11:00 AM',
      location: 'Loading...',
      status: 'scheduled'
    }
  ]);

  // Fetch shelter location and update meetings
  React.useEffect(() => {
    const fetchShelterLocation = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/shelter/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const loc = data.location?.formattedAddress || data.address || "Shelter Location";
          setShelterLocation(loc);

          // Update all scheduled meetings to use this location (simulating real data)
          setMeetAndGreets(prev => prev.map(m => ({
            ...m,
            location: loc
          })));
        }
      } catch (error) {
        console.error("Failed to fetch shelter location", error);
      }
    };
    fetchShelterLocation();
  }, [token]);

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding for remaining grid cells (6 rows * 7 cols = 42)
    const remainingCells = 42 - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(null);
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1: Date, date2: Date | string) => {
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return date1.getDate() === d2.getDate() && 
           date1.getMonth() === d2.getMonth() && 
           date1.getFullYear() === d2.getFullYear();
  };

  const getMeetingsForDay = (date: Date) => {
    return meetAndGreets.filter(m => {
      // Parse the date string "YYYY-MM-DD" in local time to avoid timezone shifts
      const [year, month, day] = m.date.split('-').map(Number);
      return date.getFullYear() === year &&
             date.getMonth() === month - 1 &&
             date.getDate() === day;
    });
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };



  const handleRescheduleConfirm = (data: MeetAndGreetData) => {
    if (selectedMeeting) {
      // Editing existing meeting
      setMeetAndGreets(meetAndGreets.map(m => m.id === selectedMeeting.id ? {
        ...m,
        ...data,
        status: 'rescheduled' as const
      } : m));
    } else {
      // Creating new meeting
      const newMeeting: MeetAndGreet = {
        id: Math.random().toString(36).substr(2, 9),
        applicantName: 'New Applicant', // Mock
        applicantEmail: 'applicant@example.com',
        petName: 'Unknown Pet', // Mock
        petImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100',
        status: 'scheduled',
        ...data
      };
      setMeetAndGreets([...meetAndGreets, newMeeting]);
      showToast('New meeting scheduled successfully!', 'success');
    }
  };

  const handleCompleteConfirm = () => {
    if (selectedMeeting) {
      setMeetAndGreets(meetAndGreets.map(m => m.id === selectedMeeting.id ? {
        ...m,
        status: 'completed' as const
      } : m));
      showToast('Meeting confirmed! Moving application to Adoption Finalization.', 'success');
      setShowCompleteDialog(false);
    }
  };

  const activeMeetings = meetAndGreets.filter(m => m.status === 'scheduled' || m.status === 'rescheduled');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header - Fixed Height */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <HamburgerMenu />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Meet & Greet Schedule</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'calendar' ? 'bg-white shadow text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 inline-block mr-1.5" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white shadow text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Search className="w-4 h-4 inline-block mr-1.5" />
                  List
                </button>
              </div>
              <Button 
                size="sm" 
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setSelectedMeeting(null); 
                  setShowRescheduleModal(true);
                }}
              >
                New Meeting
              </Button>
              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Main Content - Flex-1 with overflow hidden to contain calendar */}
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          
          {/* Quick Stats Row - Fixed Height */}
          <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Today</p>
                <p className="text-xl font-bold text-gray-900">
                  {activeMeetings.filter(m => isSameDay(new Date(), m.date)).length}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </Card>
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Start Confirmation</p>
                <p className="text-xl font-bold text-gray-900">
                  {activeMeetings.filter(m => m.status === 'scheduled').length}
                </p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-amber-600" />
              </div>
            </Card>
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Upcoming</p>
                <p className="text-xl font-bold text-gray-900">
                  {activeMeetings.length}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
              </div>
            </Card>
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Completed</p>
                <p className="text-xl font-bold text-gray-900">
                  {meetAndGreets.filter(m => m.status === 'completed').length}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
            </Card>
          </div>

          {viewMode === 'calendar' ? (
            <div className="flex-1 flex gap-4 min-h-0">
              {/* Calendar Grid - Flex-1 to fill space */}
              <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border border-gray-200">
                {/* Month Navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                   <h2 className="text-lg font-bold text-gray-800">
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  {DAYS.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Cells - Fill remaining height */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-gray-100 divide-y bg-white min-h-0">
                  {getDaysInMonth(currentDate).map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="bg-gray-50/30" />;

                    const meetings = getMeetingsForDay(date);
                    const isCurrentDay = isToday(date);

                    return (
                      <div key={date.toISOString()} className={`p-1 relative group hover:bg-gray-50 transition-colors flex flex-col ${
                        isCurrentDay ? 'bg-blue-50/20' : ''
                      }`}>
                        <div className="flex justify-between items-start mb-1 px-1">
                          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                             isCurrentDay 
                               ? 'bg-[var(--color-primary)] text-white' 
                               : 'text-gray-500'
                           }`}>
                            {date.getDate()}
                          </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar px-1">
                          {meetings.map(meeting => (
                            <button 
                              key={meeting.id}
                              onClick={() => {
                                setSelectedMeeting(meeting);
                                setShowRescheduleModal(true);
                              }}
                              className={`w-full text-left px-1.5 py-1 rounded text-[10px] sm:text-xs truncate transition-all border-l-2 mb-0.5 ${
                                meeting.status === 'completed'
                                  ? 'bg-green-50 border-green-500 text-green-700 opacity-60'
                                  : 'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-100 shadow-sm'
                              }`}
                            >
                              <span className="font-bold mr-1">{meeting.time}</span>
                              {meeting.applicantName}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Side Panel - Fixed Width */}
              <div className="hidden xl:flex w-80 flex-col gap-4 flex-shrink-0 min-h-0 overflow-y-auto">
                 <Card className="flex-1 p-4 shadow-sm border border-gray-200">
                   <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Upcoming Schedule</h3>
                   <div className="space-y-3">
                     {activeMeetings.slice(0, 6).map(meeting => (
                        <div 
                          key={meeting.id} 
                          className="flex gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-200 group"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowRescheduleModal(true);
                          }}
                        >
                          <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-100">
                            <span className="text-[10px] font-bold uppercase tracking-wide">
                              {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold leading-none">
                              {new Date(meeting.date).getDate()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate text-sm">{meeting.applicantName}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                              <span className="truncate">w/ {meeting.petName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {meeting.time}
                              </span>
                            </div>
                          </div>
                          
                          <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                     ))}
                   </div>
                 </Card>
              </div>
            </div>
          ) : (
            // List View (Scrollable)
            <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4 flex-shrink-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search meetings..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                  />
                </div>
                <Button variant="outline" icon={<Filter className="w-4 h-4" />}>Filter</Button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Applicant & Pet</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {meetAndGreets.map(meeting => (
                      <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={meeting.petImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="font-medium text-gray-900">{meeting.applicantName}</p>
                              <p className="text-xs text-gray-500">Meeting {meeting.petName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(meeting.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">{meeting.time}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{meeting.location}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            meeting.status === 'scheduled' ? 'info' : 
                            meeting.status === 'completed' ? 'success' : 
                            'neutral'
                          }>
                            {meeting.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => {
                               setSelectedMeeting(meeting);
                               setShowRescheduleModal(true);
                             }}
                           >
                             Manage
                           </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </main>
      </div>

      {/* Confirmation/Manage Modal */}
      {(selectedMeeting || showRescheduleModal) && (
        <>
          <MeetAndGreetModal 
            isOpen={showRescheduleModal} 
            onClose={() => {
              setShowRescheduleModal(false);
              setSelectedMeeting(null);
            }} 
            onConfirm={handleRescheduleConfirm} 
            onComplete={selectedMeeting ? () => {
              setShowRescheduleModal(false);
              setShowCompleteDialog(true);
            } : undefined}
            applicantName={selectedMeeting?.applicantName || 'New Applicant'} 
            petName={selectedMeeting?.petName || 'Select Pet'} 
            initialData={selectedMeeting ? {
              date: selectedMeeting.date,
              time: selectedMeeting.time,
              location: selectedMeeting.location,
              notes: selectedMeeting.notes
            } : {
              location: shelterLocation
            }}
          />
          
          <ConfirmationDialog
            isOpen={showCompleteDialog}
            onClose={() => setShowCompleteDialog(false)}
            onConfirm={handleCompleteConfirm}
            title="Confirm Successful Meeting?"
            message={`Has the meet & greet between ${selectedMeeting?.applicantName} and ${selectedMeeting?.petName} been completed successfully? This will move the application to the final adoption stage.`}
            confirmText="Yes, Complete & Finalize"
            variant="success"
          />
        </>
      )}
      
      {/* Floating Action Button for manual complete if needed, or integrated into the UI buttons above */}
    </div>
  );
}
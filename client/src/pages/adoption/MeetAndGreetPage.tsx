import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  User,
} from "lucide-react";
import { ShelterSidebar } from "../../components/layout/ShelterSidebar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import { ScheduleMeetingModal } from "../../components/adoption/ScheduleMeetingModal";
import { CompleteMeetingModal } from "../../components/adoption/CompleteMeetingModal";
import { useToast } from "../../components/ui/Toast";
import api from "../../utils/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MeetAndGreetPage() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  
  // Modal State
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data
  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/applications/shelter/meet-and-greets');
      setMeetings(response.data.meetings || []);
    } catch (error: any) {
      console.error("Error fetching meetings:", error);
      showToast("Failed to load meet & greet schedule", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Handle query params for direct navigation
  useEffect(() => {
    const appId = searchParams.get('applicationId');
    const action = searchParams.get('action'); // 'schedule' or 'complete'

    if (appId) {
      const handleDirectAccess = async () => {
        // First check if it's already in our list
        let app = meetings.find(m => m._id === appId);
        
        // If not in list (e.g. newly approved), fetch it specifically
        if (!app) {
          try {
            const res = await api.get(`/applications/${appId}`);
            app = res.data;
          } catch (err) {
            console.error("Error fetching direct application:", err);
            return;
          }
        }

        if (app) {
          setSelectedApplication(app);
          // Open appropriate modal based on action or status
          if (action === 'complete' || app.status === 'meeting_scheduled') {
             // If status is scheduled, we might want to complete OR reschedule.
             // Default to complete if action is explicit, otherwise maybe show details? 
             // For now, if passed from detail page with 'schedule' intent, open schedule modal
             if (action === 'schedule') {
                setShowScheduleModal(true);
             } else if (app.status === 'meeting_scheduled') {
                // If just navigating to view, maybe don't auto-open unless action is set
                // But user requirement implies flow continuity.
             }
          } else {
             // Default to schedule modal for other statuses
             setShowScheduleModal(true);
          }
        }
      };
      
      // Only run if meetings execution is done or separate from it
      // Actually we can run this independently. 
      // But to avoid race conditions with meetings fetch, let's just trigger it.
      if (appId) handleDirectAccess();
    }
  }, [searchParams, meetings.length]); // extensive dependency to retry if meetings load later

  // Handlers
  const handleScheduleMeeting = async (data: any) => {
    try {
      setActionLoading(true);
      await api.put(`/applications/${selectedApplication._id}/schedule-meeting`, data);
      showToast("Meeting scheduled successfully!", "success");
      setShowScheduleModal(false);
      fetchMeetings(); // Refresh list
    } catch (error: any) {
      console.error("Error scheduling meeting:", error);
      showToast(error.response?.data?.message || "Failed to schedule meeting", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMeeting = async (data: any) => {
    try {
      setActionLoading(true);
      await api.put(`/applications/${selectedApplication._id}/complete-meeting`, data);
      showToast("Meeting completed successfully!", "success");
      setShowCompleteModal(false);
      fetchMeetings(); // Refresh list
    } catch (error: any) {
      console.error("Error completing meeting:", error);
      showToast(error.response?.data?.message || "Failed to complete meeting", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    
    const remainingCells = 42 - days.length;
    for (let i = 0; i < remainingCells; i++) days.push(null);

    return days;
  };

  const isSameDay = (date1: Date, date2: string) => {
    if (!date2) return false;
    const d2 = new Date(date2);
    return date1.getDate() === d2.getDate() &&
           date1.getMonth() === d2.getMonth() &&
           date1.getFullYear() === d2.getFullYear();
  };

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter((m) => {
      const meetingDate = m.meetAndGreet?.confirmedSlot?.date;
      return meetingDate && isSameDay(date, meetingDate);
    });
  };

  // Helper to shorten long addresses
  const getShortenedAddress = (fullAddress: string | undefined): string => {
    if (!fullAddress) return '';
    // Split by comma and take first 3 parts (e.g., "Building, Street, Area")
    const parts = fullAddress.split(',').map(part => part.trim());
    return parts.slice(0, 3).join(', ');
  };



  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <HamburgerMenu />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Meet & Greet Schedule
              </h1>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === "calendar" ? "bg-white shadow text-[var(--color-primary)]" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 inline-block mr-1.5" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === "list" ? "bg-white shadow text-[var(--color-primary)]" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Search className="w-4 h-4 inline-block mr-1.5" />
                  List
                </button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchMeetings()}
              >
                Refresh
              </Button>
              <NotificationCenter />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
             {/* Stats Row */}
          <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Today</p>
                <p className="text-xl font-bold text-gray-900">
                  {meetings.filter(m => m.meetAndGreet?.confirmedSlot?.date && isSameDay(new Date(), m.meetAndGreet.confirmedSlot.date)).length}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div>
            </Card>
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Pending Action</p>
                <p className="text-xl font-bold text-gray-900">
                   {meetings.filter(m => m.status === "availability_submitted").length}
                </p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg"><CheckCircle className="w-5 h-5 text-amber-600" /></div>
            </Card>
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Upcoming</p>
                <p className="text-xl font-bold text-gray-900">
                  {meetings.filter(m => m.status === "meeting_scheduled").length}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg"><CalendarIcon className="w-5 h-5 text-purple-600" /></div>
            </Card>
            <Card className="p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Completed</p>
                <p className="text-xl font-bold text-gray-900">
                   {meetings.filter(m => m.status === "meeting_completed").length}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg"><User className="w-5 h-5 text-green-600" /></div>
            </Card>
          </div>

          {isLoading ? (
             <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
             </div>
          ) : viewMode === "calendar" ? (
             <div className="flex-1 flex gap-4 min-h-0">
               <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border border-gray-200">
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">
                      {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    {DAYS.map(day => <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">{day}</div>)}
                  </div>
                  <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-gray-100 divide-y bg-white min-h-0">
                    {getDaysInMonth(currentDate).map((date, idx) => {
                      if (!date) return <div key={`empty-${idx}`} className="bg-gray-50/30" />;
                      const dayMeetings = getMeetingsForDay(date);
                      const isToday = isSameDay(new Date(), date.toISOString());
                      
                      return (
                        <div key={date.toISOString()} className={`p-1 relative group hover:bg-gray-50 transition-colors flex flex-col ${isToday ? 'bg-blue-50/20' : ''}`}>
                          <div className="flex justify-between items-start mb-1 px-1">
                            <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--color-primary)] text-white' : 'text-gray-500'}`}>
                              {date.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar px-1">
                            {dayMeetings.map(meeting => (
                              <button
                                key={meeting._id}
                                onClick={() => {
                                  setSelectedApplication(meeting);
                                  if (meeting.status === 'meeting_scheduled') {
                                     setShowCompleteModal(true); // Or show details/reschedule
                                  } else {
                                     setShowScheduleModal(true);
                                  }
                                }}
                                className={`w-full text-left px-1.5 py-1 rounded text-[10px] truncate border-l-2 mb-0.5 ${
                                  meeting.status === 'meeting_completed' ? 'bg-green-50 border-green-500 text-green-700 opacity-60' :
                                  'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-100'
                                }`}
                              >
                                <span className="font-bold mr-1">{meeting.meetAndGreet?.confirmedSlot?.specificTime || meeting.meetAndGreet?.confirmedSlot?.timeSlot}</span>
                                {meeting.adopter?.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </Card>
               
               {/* Side Panel for List in Calendar View */}
               <div className="hidden xl:flex w-80 flex-col gap-4 flex-shrink-0 min-h-0 overflow-y-auto">
                 <Card className="flex-1 p-4 shadow-sm border border-gray-200">
                   <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Pending Scheduling</h3>
                   <div className="space-y-3">
                     {meetings.filter(m => m.status === 'availability_submitted').map(meeting => (
                       <div 
                         key={meeting._id} 
                         onClick={() => { setSelectedApplication(meeting); setShowScheduleModal(true); }}
                         className="flex gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200"
                       >
                         <img src={meeting.pet?.images?.[0] || ""} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                         <div className="min-w-0">
                           <h4 className="font-semibold text-gray-900 text-sm truncate">{meeting.adopter?.name}</h4>
                           <p className="text-xs text-gray-500 truncate">w/ {meeting.pet?.name}</p>
                           <Badge variant="warning" className="mt-1 text-[10px] px-1.5 py-0">Action Needed</Badge>
                         </div>
                       </div>
                     ))}
                     {meetings.filter(m => m.status === 'availability_submitted').length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
                     )}
                   </div>
                 </Card>
               </div>
             </div>
          ) : (
            // List View
            <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border border-gray-200">
               <div className="overflow-auto">
                 <table className="w-full">
                   <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                       <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Applicant & Pet</th>
                       <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                       <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Meeting Time</th>
                       <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {meetings.map(meeting => (
                       <tr key={meeting._id} className="hover:bg-gray-50">
                         <td className="py-3 px-4">
                           <div className="flex items-center gap-3">
                              <img src={meeting.pet?.images?.[0] || ""} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                              <div>
                                <p className="font-medium text-gray-900">{meeting.adopter?.name}</p>
                                <p className="text-xs text-gray-500">for {meeting.pet?.name}</p>
                              </div>
                           </div>
                         </td>
                         <td className="py-3 px-4">
                           <Badge variant={meeting.status === 'meeting_completed' ? 'success' : meeting.status === 'meeting_scheduled' ? 'info' : 'warning'}>
                             {meeting.status.replace('_', ' ')}
                           </Badge>
                         </td>
                         <td className="py-3 px-4 text-sm text-gray-600">
                            {meeting.meetAndGreet?.confirmedSlot?.date ? (
                               <>
                                 {new Date(meeting.meetAndGreet.confirmedSlot.date).toLocaleDateString()} <br/>
                                 {meeting.meetAndGreet.confirmedSlot.specificTime || meeting.meetAndGreet.confirmedSlot.timeSlot}
                               </>
                            ) : '-'}
                         </td>
                         <td className="py-3 px-4 text-right">
                           <Button size="sm" variant="ghost" onClick={() => {
                              setSelectedApplication(meeting);
                              if (meeting.status === 'meeting_scheduled') setShowCompleteModal(true);
                              else setShowScheduleModal(true);
                           }}>
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

          {/* Modals */}
          {selectedApplication && (
            <>
              <ScheduleMeetingModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                application={selectedApplication}
                defaultLocation={getShortenedAddress(selectedApplication.shelter?.location?.formattedAddress)}
                onSchedule={handleScheduleMeeting}
                isLoading={actionLoading}
              />
              <CompleteMeetingModal
                isOpen={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                application={selectedApplication}
                onComplete={handleCompleteMeeting}
                isLoading={actionLoading}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}




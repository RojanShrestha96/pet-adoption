import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, XCircle, FileText, User, Home, Phone, Mail,
  Clock, Dog, Cat, MapPin, Briefcase, Heart, Users, CalendarCheck,
  Send, MessageSquare, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ShelterSidebar } from '../components/ShelterSidebar';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { NotificationCenter } from '../components/NotificationCenter';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { DocumentViewer } from '../components/DocumentViewer';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../components/Toast';

// Workflow Steps
const workflowSteps = [
  { key: 'submitted', label: 'Application Submitted', icon: FileText },
  { key: 'under-review', label: 'Under Review', icon: Eye },
  { key: 'decision-pending', label: 'Decision Pending', icon: Clock },
  { key: 'approved', label: 'Decision Approved', icon: CheckCircle },
  { key: 'meet-greet', label: 'Meet & Greet', icon: CalendarCheck },
  { key: 'accepted', label: 'Adoption Accepted', icon: Heart },
  { key: 'finalized', label: 'Finalized', icon: CheckCircle }
];

type WorkflowStatus = 'submitted' | 'under-review' | 'decision-pending' | 'approved' | 'meet-greet' | 'accepted' | 'finalized';

export function ApplicationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['applicant', 'pet', 'documents', 'timeline']);

  // Mock data with expanded workflow
  const application = {
    id: id || 'APP-001',
    currentStep: 'under-review' as WorkflowStatus,
    submittedAt: '2024-12-10T10:30:00',
    pet: {
      id: 'pet-1',
      name: 'Luna',
      species: 'dog' as const,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      breed: 'Golden Retriever',
      age: '2 years',
      gender: 'Female',
      size: 'Large'
    },
    applicant: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Pine Street, Seattle, WA 98101',
      occupation: 'Software Engineer',
      employer: 'Tech Corp Inc.',
      homeType: 'House with Fenced Yard',
      homeOwnership: 'Own',
      hasYard: true,
      hasPets: true,
      existingPets: '1 cat (indoor)',
      hasChildren: false,
      experience: 'Had dogs growing up, currently care for a cat',
      veterinarian: 'Dr. Smith at Seattle Pet Clinic',
      references: [
        { name: 'John Wilson', relation: 'Neighbor', phone: '+1 (555) 234-5678' },
        { name: 'Emily Davis', relation: 'Friend', phone: '+1 (555) 345-6789' }
      ],
      reasonForAdoption: 'Looking for a companion for outdoor activities and to complete our family.',
      workSchedule: 'Hybrid - work from home 3 days/week'
    },
    documents: [
      { id: 1, name: 'Government ID.pdf', type: 'application/pdf', url: '#', verified: true, uploadedAt: '2024-12-10' },
      { id: 2, name: 'Proof of Residence.pdf', type: 'application/pdf', url: '#', verified: true, uploadedAt: '2024-12-10' },
      { id: 3, name: 'Home Photos.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', verified: false, uploadedAt: '2024-12-10' },
      { id: 4, name: 'Yard Photos.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', verified: false, uploadedAt: '2024-12-10' }
    ],
    timeline: [
      { id: 1, event: 'Application Submitted', date: '2024-12-10T10:30:00', description: 'Application received', icon: 'submit' },
      { id: 2, event: 'Documents Uploaded', date: '2024-12-10T10:35:00', description: '4 documents attached', icon: 'document' },
      { id: 3, event: 'Status Changed to Under Review', date: '2024-12-10T14:00:00', description: 'Assigned to staff member', icon: 'review' },
      { id: 4, event: 'ID Verified', date: '2024-12-11T09:00:00', description: 'Government ID confirmed', icon: 'verify' },
      { id: 5, event: 'Address Verified', date: '2024-12-11T09:15:00', description: 'Proof of residence confirmed', icon: 'verify' }
    ],
    scheduledDate: null as string | null,
    notes: ''
  };

  const currentStepIndex = workflowSteps.findIndex(s => s.key === application.currentStep);

  const getNextAction = () => {
    switch (application.currentStep) {
      case 'submitted': return 'Move to Review';
      case 'under-review': return 'Documents verified, make decision';
      case 'decision-pending': return 'Approve or reject application';
      case 'approved': return 'Schedule meet & greet';
      case 'meet-greet': return 'Confirm adoption after meeting';
      case 'accepted': return 'Complete adoption paperwork';
      default: return 'Application complete';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit'
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleApprove = () => {
    showToast('Application approved! Moving to Meet & Greet scheduling. 🎉', 'success');
    setShowApprove(false);
  };

  const handleReject = () => {
    showToast('Application rejected. Notification sent to applicant.', 'info');
    setShowReject(false);
    navigate('/shelter/applications');
  };

  const handleVerifyDoc = () => {
    showToast('Document verified successfully', 'success');
    setSelectedDoc(null);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <HamburgerMenu />
              </div>
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Application Review</h1>
                  <Badge variant="info">#{application.id}</Badge>
                </div>
                <p className="text-sm text-gray-500">Submitted {formatDate(application.submittedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationCenter />
              {(application.currentStep === 'under-review' || application.currentStep === 'decision-pending') && (
                <>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50" 
                    onClick={() => setShowReject(true)} 
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                  <Button 
                    variant="primary" 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={() => setShowApprove(true)} 
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Approve</span>
                  </Button>
                </>
              )}
              {application.currentStep === 'approved' && (
                <Button 
                  variant="primary" 
                  onClick={() => setShowSchedule(true)} 
                  icon={<CalendarCheck className="w-4 h-4" />}
                >
                  Schedule Meet & Greet
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Progress Stepper */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Application Progress</h2>
              
              {/* Desktop: Horizontal Stepper */}
              <div className="hidden md:block">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line Background */}
                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
                  {/* Progress Line Active */}
                  <motion.div 
                    className="absolute left-0 top-5 h-0.5 bg-[var(--color-primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  
                  {workflowSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <motion.div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted 
                              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                              : isCurrent
                                ? 'bg-white border-[var(--color-primary)] text-[var(--color-primary)]'
                                : 'bg-gray-100 border-gray-200 text-gray-400'
                          }`}
                          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.8, repeat: isCurrent ? Infinity : 0, repeatDelay: 2 }}
                        >
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </motion.div>
                        <p className={`text-xs mt-2 text-center max-w-[80px] ${
                          isCurrent ? 'text-[var(--color-primary)] font-semibold' : 
                          isCompleted ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile: Vertical Compact Stepper */}
              <div className="md:hidden">
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {workflowSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div 
                        key={step.key} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium ${
                          isCompleted 
                            ? 'bg-green-100 text-green-700'
                            : isCurrent
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted && <CheckCircle className="w-3 h-3" />}
                        {step.label.split(' ')[0]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Action */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-gray-700">Next Action:</span>
                  <span className="text-amber-600">{getNextAction()}</span>
                </div>
              </div>
            </Card>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pet Information Card */}
                <Card className="overflow-hidden">
                  <button 
                    onClick={() => toggleSection('pet')}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${application.pet.species === 'dog' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                        {application.pet.species === 'dog' ? <Dog className="w-5 h-5" /> : <Cat className="w-5 h-5" />}
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Pet Information</h2>
                    </div>
                    {expandedSections.includes('pet') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.includes('pet') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <img 
                              src={application.pet.image} 
                              alt={application.pet.name} 
                              className="w-full sm:w-32 h-32 rounded-xl object-cover"
                            />
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                                <p className="font-bold text-gray-900 text-lg">{application.pet.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Breed</p>
                                <p className="font-medium text-gray-900">{application.pet.breed}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Age</p>
                                <p className="font-medium text-gray-900">{application.pet.age}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Gender</p>
                                <p className="font-medium text-gray-900">{application.pet.gender}</p>
                              </div>
                            </div>
                          </div>
                          <Link to={`/pet/${application.pet.id}`}>
                            <Button variant="outline" size="sm" className="mt-4" icon={<Eye className="w-4 h-4" />}>
                              View Pet Profile
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Applicant Information Card */}
                <Card className="overflow-hidden">
                  <button 
                    onClick={() => toggleSection('applicant')}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                        <User className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Applicant Information</h2>
                    </div>
                    {expandedSections.includes('applicant') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.includes('applicant') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0 space-y-6">
                          {/* Contact Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Full Name</p>
                              <p className="font-medium text-gray-900">{application.applicant.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <p className="font-medium text-gray-900">{application.applicant.email}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phone</p>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <p className="font-medium text-gray-900">{application.applicant.phone}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Occupation</p>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <p className="font-medium text-gray-900">{application.applicant.occupation}</p>
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Address</p>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <p className="font-medium text-gray-900">{application.applicant.address}</p>
                            </div>
                          </div>

                          {/* Home & Lifestyle */}
                          <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Home className="w-4 h-4 text-[var(--color-primary)]" />
                              Home & Lifestyle
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Home Type</p>
                                <p className="font-medium text-gray-900 text-sm">{application.applicant.homeType}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Ownership</p>
                                <p className="font-medium text-gray-900 text-sm">{application.applicant.homeOwnership}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Has Yard</p>
                                <p className="font-medium text-gray-900 text-sm">{application.applicant.hasYard ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Existing Pets</p>
                                <p className="font-medium text-gray-900 text-sm">{application.applicant.existingPets || 'None'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Children</p>
                                <p className="font-medium text-gray-900 text-sm">{application.applicant.hasChildren ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Work Schedule</p>
                                <p className="font-medium text-gray-900 text-sm">{application.applicant.workSchedule}</p>
                              </div>
                            </div>
                          </div>

                          {/* Experience & Reason */}
                          <div className="pt-4 border-t border-gray-100">
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pet Experience</p>
                              <p className="text-gray-700 text-sm">{application.applicant.experience}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reason for Adoption</p>
                              <p className="text-gray-700 text-sm">{application.applicant.reasonForAdoption}</p>
                            </div>
                          </div>

                          {/* References */}
                          <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-[var(--color-primary)]" />
                              References
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {application.applicant.references.map((ref, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                  <p className="font-medium text-gray-900 text-sm">{ref.name}</p>
                                  <p className="text-xs text-gray-500">{ref.relation} • {ref.phone}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" icon={<Mail className="w-4 h-4" />}>
                              Email
                            </Button>
                            <Button variant="outline" size="sm" icon={<Phone className="w-4 h-4" />}>
                              Call
                            </Button>
                            <Button variant="outline" size="sm" icon={<MessageSquare className="w-4 h-4" />}>
                              Message
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Documents Card */}
                <Card className="overflow-hidden">
                  <button 
                    onClick={() => toggleSection('documents')}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                        <Badge variant="info">{application.documents.length}</Badge>
                      </div>
                    </div>
                    {expandedSections.includes('documents') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.includes('documents') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {application.documents.map(doc => (
                              <div 
                                key={doc.id} 
                                onClick={() => setSelectedDoc(doc)}
                                className="p-4 border border-gray-200 rounded-xl hover:border-[var(--color-primary)] hover:bg-gray-50 cursor-pointer transition-all group"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                  </div>
                                  {doc.verified ? (
                                    <Badge variant="success">Verified</Badge>
                                  ) : (
                                    <Badge variant="warning">Pending</Badge>
                                  )}
                                </div>
                                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                <p className="text-xs text-gray-500">Uploaded {doc.uploadedAt}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>

              {/* Right Column - Timeline */}
              <div className="space-y-6">
                {/* Timeline Card */}
                <Card className="p-4 sm:p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                    Activity Timeline
                  </h2>
                  
                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {application.timeline.map((event) => (
                      <div key={event.id} className="relative pl-8">
                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          event.icon === 'verify' ? 'bg-green-500' :
                          event.icon === 'review' ? 'bg-blue-500' :
                          event.icon === 'document' ? 'bg-purple-500' :
                          'bg-[var(--color-primary)]'
                        }`} />
                        <p className="text-sm font-medium text-gray-900">{event.event}</p>
                        <p className="text-xs text-gray-500">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(event.date)} at {formatTime(event.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card className="p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Submitted</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(application.submittedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Documents</span>
                      <span className="text-sm font-medium text-gray-900">
                        {application.documents.filter(d => d.verified).length}/{application.documents.length} Verified
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">References</span>
                      <span className="text-sm font-medium text-gray-900">{application.applicant.references.length} Provided</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Time in Current Step</span>
                      <span className="text-sm font-medium text-gray-900">2 days</span>
                    </div>
                  </div>
                </Card>

                {/* Notes Section */}
                <Card className="p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Staff Notes</h3>
                  <textarea 
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    rows={3}
                    placeholder="Add notes about this application..."
                  />
                  <Button variant="outline" size="sm" className="mt-2" icon={<Send className="w-4 h-4" />}>
                    Save Note
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <DocumentViewer 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        document={selectedDoc} 
        onVerify={handleVerifyDoc} 
        isVerified={selectedDoc?.verified} 
      />

      <ConfirmationDialog 
        isOpen={showApprove} 
        onClose={() => setShowApprove(false)} 
        onConfirm={handleApprove} 
        title="Approve Application?" 
        message="This will notify the applicant and move to the Meet & Greet scheduling phase." 
        confirmText="Yes, Approve" 
        variant="success" 
      />

      <ConfirmationDialog 
        isOpen={showReject} 
        onClose={() => setShowReject(false)} 
        onConfirm={handleReject} 
        title="Reject Application?" 
        message="Are you sure? This action cannot be undone. The applicant will be notified via email." 
        confirmText="Reject" 
        variant="danger" 
      />
    </div>
  );
}
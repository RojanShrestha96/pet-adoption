import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, User, MapPin, Phone, Mail, Clock, Palette, 
  Lock, Bell, FileText, Upload, Shield, Map
} from 'lucide-react';
import { ShelterSidebar } from '../components/ShelterSidebar';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { Badge } from '../components/Badge';
import { LocationPicker } from '../components/LocationPicker';

type Tab = 'profile' | 'security' | 'preferences' | 'location' | 'documentation';

export function SettingsPage() {
  const { showToast } = useToast();
  const { token, user } = useAuth();
  const { currentTheme, changeTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form Data States
  const [formData, setFormData] = useState({
    shelterName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    operatingHours: {
      sunday: { open: '09:00', close: '17:00', closed: true },
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false }
    },
    establishedDate: '',
    contactPerson: '',
    theme: 'friendly'
  });

  const [locationData, setLocationData] = useState({
    lat: '',
    lng: '',
    formattedAddress: ''
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      applicationUpdates: true
    },
    publicVisibility: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [documents, setDocuments] = useState<any[]>([]);

  // Fetch current data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/shelter/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFormData({
            shelterName: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            description: data.description || '',
            operatingHours: data.operatingHours || {
              sunday: { open: '09:00', close: '17:00', closed: true },
              monday: { open: '09:00', close: '17:00', closed: false },
              tuesday: { open: '09:00', close: '17:00', closed: false },
              wednesday: { open: '09:00', close: '17:00', closed: false },
              thursday: { open: '09:00', close: '17:00', closed: false },
              friday: { open: '09:00', close: '17:00', closed: false },
              saturday: { open: '10:00', close: '16:00', closed: false }
            },
            establishedDate: data.establishedDate ? data.establishedDate.split('T')[0] : '',
            contactPerson: data.contactPerson || '',
            theme: data.theme || 'friendly'
          });
          
          if (data.location) {
            setLocationData({
              lat: data.location.lat || '',
              lng: data.location.lng || '',
              formattedAddress: data.location.formattedAddress || ''
            });
          }

          if (data.preferences) {
            setPreferences(prev => ({ ...prev, ...data.preferences }));
          }

          if (data.documentation) {
            setDocuments(data.documentation);
          }

          // Sync theme
          if (data.theme && data.theme !== currentTheme) {
            changeTheme(data.theme as any);
          }
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        showToast("Failed to load profile", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Construct payload based on all states
      const payload = { 
        ...formData, 
        name: formData.shelterName, 
        theme: currentTheme,
        location: {
          lat: parseFloat(locationData.lat) || 0,
          lng: parseFloat(locationData.lng) || 0,
          formattedAddress: locationData.formattedAddress
        },
        preferences,
        documentation: documents
      };
      
      const response = await fetch('http://localhost:5000/api/shelter/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to update");

      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password changed successfully', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
         showToast(data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      showToast('Failed to change password', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      const newDoc = {
        title: file.name,
        type: 'General',
        url: URL.createObjectURL(file), // Mock URL
        uploadedAt: new Date().toISOString()
      };
      setDocuments([...documents, newDoc]);
      showToast('Document uploaded successfully', 'success');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'documentation', label: 'Documents', icon: FileText },
  ];

  if (isLoading) {
      return (
        <div className="flex min-h-screen bg-[var(--color-background)]">
          <ShelterSidebar />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Loading settings..." />
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
        <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-gray-900">Shelter Settings</h1>
          <p className="text-sm text-gray-500">Manage your shelter profile and preferences</p>
        </header>

        <main className="flex-1 p-8 overflow-y-auto w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1 space-y-2">
              <Card className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        activeTab === tab.id 
                          ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                          <img
                            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200"
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                          Change
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {formData.shelterName || user?.name}
                        </h3>
                        <p className="text-sm text-gray-500">Shelter ID: #{user?.id?.slice(-6)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Shelter Name"
                        value={formData.shelterName}
                        onChange={(e) => setFormData({ ...formData, shelterName: e.target.value })}
                        fullWidth
                      />
                      <Input
                        label="Contact Person"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        icon={<User className="w-5 h-5" />}
                        fullWidth
                      />
                      <Input
                        label="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={<Mail className="w-5 h-5" />}
                        fullWidth
                      />
                      <Input
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        icon={<Phone className="w-5 h-5" />}
                        fullWidth
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Established Date"
                          type="date"
                          value={formData.establishedDate}
                          onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                          fullWidth
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Weekly Operating Hours
                          </label>
                          <div className="flex gap-2">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const mondayHours = formData.operatingHours.monday;
                                const newHours = { ...formData.operatingHours };
                                ['tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                                  newHours[day as keyof typeof newHours] = { ...mondayHours };
                                });
                                setFormData({ ...formData, operatingHours: newHours });
                                showToast('Copied Monday hours to weekdays', 'success');
                              }}
                              className="text-xs"
                            >
                              Copy Mon to Weekdays
                            </Button>
                             <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const saturdayHours = formData.operatingHours.saturday;
                                const newHours = { ...formData.operatingHours };
                                ['sunday'].forEach(day => {
                                  newHours[day as keyof typeof newHours] = { ...saturdayHours };
                                });
                                setFormData({ ...formData, operatingHours: newHours });
                                showToast('Copied Saturday hours to Sunday', 'success');
                              }}
                              className="text-xs"
                            >
                              Copy Sat to Sun
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                          {/* Header Row */}
                          <div className="grid grid-cols-12 gap-4 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-3">Day</div>
                            <div className="col-span-3">Status</div>
                            <div className="col-span-6">Hours</div>
                          </div>

                          {Object.entries(formData.operatingHours || {}).map(([day, hours]: [string, any]) => (
                            <div 
                              key={day} 
                              className={`grid grid-cols-12 gap-4 items-center p-2 rounded-lg transition-colors ${
                                hours.closed ? 'opacity-60 bg-gray-100/50' : 'bg-white shadow-sm border border-gray-100'
                              }`}
                            >
                              <div className="col-span-3 font-medium capitalize text-gray-700">{day}</div>
                              <div className="col-span-3">
                                <ToggleSwitch
                                  checked={!hours.closed}
                                  onChange={(checked) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      operatingHours: {
                                        ...prev.operatingHours,
                                        [day]: { ...hours, closed: !checked }
                                      }
                                    }));
                                  }}
                                  label={hours.closed ? "Closed" : "Open"}
                                  description="" 
                                />
                              </div>
                              <div className="col-span-6">
                                {!hours.closed ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      value={hours.open}
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          operatingHours: {
                                            ...prev.operatingHours,
                                            [day]: { ...hours, open: e.target.value }
                                          }
                                        }));
                                      }}
                                      className="flex-1 min-w-0 px-2 py-1.5 rounded-md border border-gray-200 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    />
                                    <span className="text-gray-400 font-medium">-</span>
                                    <input
                                      type="time"
                                      value={hours.close}
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          operatingHours: {
                                            ...prev.operatingHours,
                                            [day]: { ...hours, close: e.target.value }
                                          }
                                        }));
                                      }}
                                      className="flex-1 min-w-0 px-2 py-1.5 rounded-md border border-gray-200 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Closed all day</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Tell us about your shelter..."
                        />
                      </div>
                    </div>
                     <div className="mt-8 flex justify-end">
                      <Button variant="primary" onClick={handleSave} disabled={isSaving} icon={<Save className="w-4 h-4"/>}>
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                    <p className="text-gray-500 mb-6 text-sm">Update your password to keep your account secure.</p>
                    
                    <div className="max-w-md space-y-5">
                      <Input 
                        label="Current Password" 
                        type="password" 
                        value={passwordData.currentPassword} 
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                        icon={<Lock className="w-5 h-5" />} 
                        fullWidth 
                      />
                      <Input 
                        label="New Password" 
                        type="password" 
                        value={passwordData.newPassword} 
                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                        icon={<Lock className="w-5 h-5" />} 
                        fullWidth 
                      />
                      <Input 
                        label="Confirm New Password" 
                        type="password" 
                        value={passwordData.confirmPassword} 
                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                        icon={<Lock className="w-5 h-5" />} 
                        fullWidth 
                      />
                      <div className="pt-4">
                        <Button variant="primary" onClick={handlePasswordChange}>
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* PREFERENCES TAB */}
                {activeTab === 'preferences' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
                    
                    <div className="space-y-8">
                       {/* Theme Settings */}
                      <div>
                        <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <Palette className="w-4 h-4" /> Visual Theme
                        </h4>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-900">Current Theme</p>
                                <p className="text-sm text-gray-500">Customize the look and feel of your dashboard</p>
                            </div>
                            <ThemeSwitcher />
                        </div>
                      </div>

                      {/* Notifs */}
                      <div>
                        <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <Bell className="w-4 h-4" /> Notifications
                        </h4>
                        <div className="space-y-4">
                          <ToggleSwitch 
                            checked={preferences.notifications.email} 
                            onChange={(c) => setPreferences(p => ({...p, notifications: {...p.notifications, email: c}}))}
                            label="Email Notifications" 
                            description="Receive updates via email" 
                          />
                           <ToggleSwitch 
                            checked={preferences.notifications.sms} 
                            onChange={(c) => setPreferences(p => ({...p, notifications: {...p.notifications, sms: c}}))}
                            label="SMS Notifications" 
                            description="Receive urgent updates via SMS" 
                          />
                          <ToggleSwitch 
                            checked={preferences.notifications.applicationUpdates} 
                            onChange={(c) => setPreferences(p => ({...p, notifications: {...p.notifications, applicationUpdates: c}}))}
                            label="Application Updates" 
                            description="Get notified when adoption status changes" 
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                 {/* LOCATION TAB */}
                {activeTab === 'location' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Shelter Location</h2>
                    
                    <p className="text-gray-500 mb-6 text-sm">
                      Set your shelter's exact location to help adopters find you easily. You can search for your address or drag the pin on the map.
                    </p>

                    <LocationPicker 
                       initialLocation={{
                         lat: parseFloat(locationData.lat) || 27.7172,
                         lng: parseFloat(locationData.lng) || 85.3240,
                         formattedAddress: locationData.formattedAddress
                       }}
                       onLocationSelect={(loc) => {
                         setLocationData({
                           lat: loc.lat.toString(),
                           lng: loc.lng.toString(),
                           formattedAddress: loc.formattedAddress
                         });
                       }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                       <Input
                        label="Latitude"
                        value={locationData.lat}
                        readOnly
                        fullWidth
                        className="bg-gray-50"
                      />
                      <Input
                        label="Longitude"
                        value={locationData.lng}
                        readOnly
                        fullWidth
                        className="bg-gray-50"
                      />
                    </div>
                     <div className="mt-2">
                        <Input
                          label="Formatted Address"
                          value={locationData.formattedAddress}
                          readOnly
                          fullWidth
                          className="bg-gray-50"
                          icon={<MapPin className="w-5 h-5" />}
                        />
                      </div>

                    <div className="mt-8 flex justify-end">
                      <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                        Update Location
                      </Button>
                    </div>
                  </Card>
                )}

                {/* DOCUMENTATION TAB */}
                {activeTab === 'documentation' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Documentation</h2>
                    <p className="text-gray-500 mb-6 text-sm">Upload shelter licenses, certificates, and other legal documents.</p>

                    <div className="mb-8">
                      <input type="file" className="hidden" id="doc-upload" onChange={handleFileUpload} />
                      <label 
                        htmlFor="doc-upload" 
                        className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-gray-50"
                      >
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                         <p className="font-medium text-gray-700">Click to upload files</p>
                         <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                      </label>
                    </div>

                    <div className="space-y-4">
                       <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Uploaded Documents</h3>
                       {documents.length === 0 && (
                         <div className="text-center py-8 text-gray-400 text-sm">No documents uploaded yet.</div>
                       )}
                       {documents.map((doc, idx) => (
                         <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-center gap-4">
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                               <FileText className="w-6 h-6" />
                             </div>
                             <div>
                               <p className="font-bold text-gray-900">{doc.title}</p>
                               <p className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                             </div>
                           </div>
                           <Badge variant="success">Verified</Badge>
                         </div>
                       ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                      <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Chatbot } from "./components/Chatbot";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdopterOnlyRoute } from "./components/AdopterOnlyRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { SearchPage } from "./pages/SearchPage";
import { AboutPage } from "./pages/AboutPage";
import { FavouritesPage } from "./pages/FavouritesPage";
import { PetDetailPage } from "./pages/PetDetailPage";
import { DonatePage } from "./pages/DonatePage";
import { ShelterDashboard } from "./pages/ShelterDashboard";
import { AddPetPage } from "./pages/AddPetPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PetsManagementPage } from "./pages/PetsManagementPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { ApplicationDetailPage } from "./pages/ApplicationDetailPage";
import { MessagesPage } from "./pages/MessagesPage";
import { AdoptionRequestPage } from "./pages/AdoptionRequestPage";
import { ApplicationTrackingPage } from "./pages/ApplicationTrackingPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminSheltersPage } from "./pages/AdminSheltersPage";
import { ApplicationAlreadySubmittedPage } from "./pages/ApplicationAlreadySubmittedPage";
import { MeetAndGreetPage } from "./pages/MeetAndGreetPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AdminAddPetPage } from "./pages/AdminAddPetPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { ShelterProfilePage } from "./pages/ShelterProfilePage";
import { ShelterMessagesPage } from "./pages/ShelterMessagesPage";
import { SuccessStoriesPage } from "./pages/SuccessStoriesPage";
import { EmailVerificationPage } from "./pages/EmailVerificationPage";
import { VerifyOTPPage } from "./pages/VerifyOTPPage";
import { EmailVerifiedPage } from "./pages/EmailVerifiedPage";
export function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
           <BrowserRouter>
           {/* Global Chatbot */}
           <Chatbot />
 
           <Routes>
             {/* ================= PUBLIC ROUTES ================= */}
             {/* ... existing public routes ... */}
              <Route
                path="/"
                element={
                  <AdopterOnlyRoute>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <HomePage />
                      </main>
                      <Footer />
                    </div>
                  </AdopterOnlyRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Public Browsing Routes */}
              <Route
                path="/search"
                element={
                  <AdopterOnlyRoute>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <SearchPage />
                      </main>
                      <Footer />
                    </div>
                  </AdopterOnlyRoute>
                }
              />
              {/* 
              <Route
                path="/about"
                element={
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      <AboutPage />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/favourites"
                element={
                  <AdopterOnlyRoute>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <FavouritesPage />
                      </main>
                      <Footer />
                    </div>
                  </AdopterOnlyRoute>
                }
              />
              <Route
                path="/donate"
                element={
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      <DonatePage />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/pet/:id"
                element={
                  <AdopterOnlyRoute>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <PetDetailPage />
                      </main>
                      <Footer />
                    </div>
                  </AdopterOnlyRoute>
                }
              />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/email-verified" element={<EmailVerifiedPage />} />
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
  
  
              {/* ================= ADOPTER ONLY ROUTES ================= */}
              {/*
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['adopter']}>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <UserProfilePage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/adopt/:petId" 
                element={
                  <ProtectedRoute allowedRoles={['adopter']}>
                    <AdoptionRequestPage />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/application-tracking/:applicationId"
                element={
                  <ProtectedRoute allowedRoles={['adopter']}>
                    <ApplicationTrackingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/application-submitted/:petId"
                element={
                  <ProtectedRoute allowedRoles={['adopter']}>
                    <ApplicationAlreadySubmittedPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute allowedRoles={['adopter']}>
                    <MessagesPage />
                  </ProtectedRoute>
                } 
              />
              */}
  
  
              {/* ================= SHELTER ONLY ROUTES ================= */}
              {/* Note: Shelters have their own Sidebar layout, so no Navbar/Footer wrapper usually */}
              {/*
              <Route 
                path="/shelter/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <ShelterDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shelter/add-pet" 
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <AddPetPage />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/shelter/manage-pets"
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <PetsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shelter/applications"
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shelter/applications/:applicationId"
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <ApplicationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/shelter/messages" 
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <ShelterMessagesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shelter/settings" 
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/shelter/meet-and-greet"
                element={
                  <ProtectedRoute allowedRoles={['shelter']}>
                    <MeetAndGreetPage />
                  </ProtectedRoute>
                }
              />
              */}
              {/* Check if this is public or private. Usually a public profile is needed. 
                  If this is "Edit Profile", it's private. If it's "View Profile", it's public.
                  Assuming public view based on ID param.
              */}
              {/* <Route path="/shelter/:id" element={<ShelterProfilePage />} /> */}
  
  
              {/* ================= ADMIN ONLY ROUTES ================= */}
              {/*
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/shelters" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSheltersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/add-pet" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAddPetPage />
                  </ProtectedRoute>
                } 
              />
              */}
           </Routes>
           </BrowserRouter>
          </SocketProvider>
         </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AdopterProfileProvider } from "./contexts/AdopterProfileContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Chatbot } from "./components/messaging/Chatbot";
import { ToastProvider } from "./components/ui/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdopterOnlyRoute } from "./components/auth/AdopterOnlyRoute";
import { HomePage } from "./pages/public/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { SearchPage } from "./pages/public/SearchPage";
import { AboutPage } from "./pages/public/AboutPage";
import { FavouritesPage } from "./pages/user/FavouritesPage";
import { PetDetailPage } from "./pages/public/PetDetailPage";
import { DonatePage } from "./pages/public/DonatePage";
import { ShelterDashboard } from "./pages/shelter/ShelterDashboard";
import { AddPetPage } from "./pages/shelter/AddPetPage";
import { EditPetPage } from "./pages/shelter/EditPetPage";
import { SettingsPage } from "./pages/user/SettingsPage";
import { PetsManagementPage } from "./pages/shelter/PetsManagementPage";
import { ApplicationsPage } from "./pages/adoption/ApplicationsPage";
import { ApplicationDetailPage } from "./pages/adoption/ApplicationDetailPage";
import { MessagesPage } from "./pages/messaging/MessagesPage";
import { AdoptionRequestPage } from "./pages/adoption/AdoptionRequestPage";
import { ApplicationTrackingPage } from "./pages/adoption/ApplicationTrackingPage";
import { MyApplicationsPage } from "./pages/adoption/MyApplicationsPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminSheltersPage } from "./pages/admin/AdminSheltersPage";
import { ApplicationAlreadySubmittedPage } from "./pages/adoption/ApplicationAlreadySubmittedPage";
import { MeetAndGreetPage } from "./pages/adoption/MeetAndGreetPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { AdminAddPetPage } from "./pages/admin/AdminAddPetPage";
import { UserProfilePage } from "./pages/user/UserProfilePage";
import { ShelterProfilePage } from "./pages/shelter/ShelterProfilePage";
import { ShelterMessagesPage } from "./pages/shelter/ShelterMessagesPage";
import { SuccessStoriesPage } from "./pages/public/SuccessStoriesPage";
import { EmailVerificationPage } from "./pages/auth/EmailVerificationPage";
import { VerifyOTPPage } from "./pages/auth/VerifyOTPPage";
import { EmailVerifiedPage } from "./pages/auth/EmailVerifiedPage";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminShelterDetailsPage } from "./pages/admin/AdminShelterDetailsPage";
import { PaymentSuccess } from "./pages/public/PaymentSuccess";
import { PaymentFailure } from "./pages/public/PaymentFailure";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { GeoTestPage } from "./pages/public/GeoTestPage";
import { AdoptionPaymentSuccess } from "./pages/adoption/AdoptionPaymentSuccess";
import { AdoptionPaymentFailure } from "./pages/adoption/AdoptionPaymentFailure";

export function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <AdopterProfileProvider>
            <SettingsProvider>
              <NotificationProvider>
                <SocketProvider>
                <BrowserRouter>
                <ScrollToTop />
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
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicOnlyRoute>
                      <SignUpPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPasswordPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicOnlyRoute>
                      <ResetPasswordPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/admin-secure-access/login"
                  element={<AdminLoginPage />}
                />

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
                  path="/payment/success"
                  element={
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <PaymentSuccess />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/payment/failure"
                  element={
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <PaymentFailure />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                {/* Adoption payment callbacks — NO auth guard (eSewa external redirect) */}
                <Route path="/adoption-payment/success/:appId" element={<AdoptionPaymentSuccess />} />
                <Route path="/adoption-payment/failure/:appId" element={<AdoptionPaymentFailure />} />
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
                <Route
                  path="/verify-email"
                  element={<EmailVerificationPage />}
                />
                <Route path="/verify-otp" element={<VerifyOTPPage />} />
                <Route path="/email-verified" element={<EmailVerifiedPage />} />
                <Route
                  path="/success-stories"
                  element={<SuccessStoriesPage />}
                />
                <Route
                  path="/geo-test"
                  element={<GeoTestPage />}
                />

                {/* ================= ADOPTER ONLY ROUTES ================= */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={["adopter"]}>
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
                  path="/my-applications"
                  element={
                    <ProtectedRoute allowedRoles={["adopter"]}>
                      <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1">
                          <MyApplicationsPage />
                        </main>
                        <Footer />
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/adopt/:petId"
                  element={
                    <ProtectedRoute allowedRoles={["adopter"]}>
                      <AdoptionRequestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/application-tracking/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={["adopter"]}>
                      <ApplicationTrackingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/application-submitted/:petId"
                  element={
                    <ProtectedRoute allowedRoles={["adopter"]}>
                      <ApplicationAlreadySubmittedPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute allowedRoles={["adopter"]}>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />

                {/* ================= SHELTER ONLY ROUTES ================= */}
                {/* Note: Shelters have their own Sidebar layout, so no Navbar/Footer wrapper usually */}
                <Route
                  path="/shelter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <ShelterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/add-pet"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <AddPetPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/edit-pet/:id"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <EditPetPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/manage-pets"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <PetsManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/applications"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/applications/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <ApplicationDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/messages"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <ShelterMessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/settings"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelter/meet-and-greet"
                  element={
                    <ProtectedRoute allowedRoles={["shelter"]}>
                      <MeetAndGreetPage />
                    </ProtectedRoute>
                  }
                />
                {/* Check if this is public or private. Usually a public profile is needed. 
                  If this is "Edit Profile", it's private. If it's "View Profile", it's public.
                  Assuming public view based on ID param.
              */}
                <Route path="/shelter/:id" element={<ShelterProfilePage />} />

                {/* ================= ADMIN ONLY ROUTES ================= */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/shelters"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminSheltersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/shelter/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminShelterDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/add-pet"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminAddPetPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
              </SocketProvider>
            </NotificationProvider>
            </SettingsProvider>
          </AdopterProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

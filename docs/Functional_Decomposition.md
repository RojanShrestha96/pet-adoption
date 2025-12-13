# Functional Decomposition Diagram (FDD) - PetMate

This document outlines the functional decomposition of the PetMate application, broken down into its core modules and sub-functions.

## Top-Level Modules
The system is divided into four primary functional areas:
1.  **Authentication & Security**
2.  **Adopter Services (Public Interface)**
3.  **Shelter Management**
4.  **Administration**

## Diagram

```mermaid
graph TD
    %% Root Node
    Root[**PetMate System**]
    
    %% Level 1: Main Modules
    Root --> Auth[**Authentication &<br>User Management**]
    Root --> Adopter[**Adopter Services**<br>(Public Interface)]
    Root --> Shelter[**Shelter Management**]
    Root --> Admin[**Administration**]

    %% Level 2: Authentication
    Auth --> Auth_Login[Login & Authorization]
    Auth --> Auth_Reg[Registration<br>(Adopter/Shelter)]
    Auth --> Auth_Rec[Password Recovery]
    Auth --> Auth_Ver[Email/OTP Verification]
    Auth --> Auth_Prof[Profile Management]

    %% Level 2: Adopter Services
    Adopter --> Adopt_Disc[**Pet Discovery**]
    Adopter --> Adopt_App[**Adoption Process**]
    Adopter --> Adopt_User[**User Dashboard**]
    Adopter --> Adopt_Misc[**Community & Info**]

    %% Level 3 items for Adopter
    Adopt_Disc --> Disc_Search[Search & Filters]
    Adopt_Disc --> Disc_Detail[Pet Details View]
    Adopt_Disc --> Disc_Fav[Manage Favorites]
    
    Adopt_App --> App_Sub[Submit Application]
    Adopt_App --> App_Track[Track Status]
    Adopt_App --> App_Comm[Chat with Shelter]
    
    Adopt_User --> User_Prof[Edit Profile]
    Adopt_User --> User_Sett[Account Settings]
    
    Adopt_Misc --> Misc_Story[Success Stories]
    Adopt_Misc --> Misc_Don[Donations]

    %% Level 2: Shelter Management
    Shelter --> Shelt_Inv[**Pet Inventory**]
    Shelter --> Shelt_App[**Application Mgmt**]
    Shelter --> Shelt_Ops[**Operations**]

    %% Level 3 items for Shelter
    Shelt_Inv --> Inv_Add[Add New Pet]
    Shelt_Inv --> Inv_Edit[Edit Pet Details]
    Shelt_Inv --> Inv_List[List & Delete Pets]
    
    Shelt_App --> Rev_List[View Applications]
    Shelt_App --> Rev_Det[Review Details]
    Shelt_App --> Rev_Dec[Approve/Reject]
    
    Shelt_Ops --> Ops_Meet[Schedule Meet & Greet]
    Shelt_Ops --> Ops_Msg[Messaging Center]
    Shelt_Ops --> Ops_Prof[Shelter Profile Profile]

    %% Level 2: Administration
    Admin --> Adm_Dash[System Dashboard]
    Admin --> Adm_Shelt[Shelter Oversight]
    Admin --> Adm_Pets[Global Pet Mgmt]
```

## Detailed Breakdown

### 1. Authentication & User Management
Core security and identity functions accessible to all user types.
*   **Login & Authorization:** Validates credentials and routes users to appropriate dashboards (Adopter vs. Shelter vs. Admin).
*   **Registration:** Handles new account creation for Adopters and initial setup for Shelters.
*   **Password Recovery:** Flows for `ForgotPasswordPage` and `ResetPasswordPage`.
*   **Verification:** Email and OTP verification steps (`VerifyOTPPage`, `EmailVerificationPage`).

### 2. Adopter Services
The public-facing side of the application for users looking to adopt.
*   **Pet Discovery:**
    *   **Search & Filter:** Advanced searching on `SearchPage`.
    *   **Pet Details:** Comprehensive view of pet info on `PetDetailPage`.
    *   **Favorites:** Saving pets for later on `FavouritesPage`.
*   **Adoption Process:**
    *   **Submission:** Multi-step wizard (`AdoptionRequestPage`).
    *   **Tracking:** Real-time status updates (`ApplicationTrackingPage`).
    *   **Communication:** Direct messaging with shelters (`MessagesPage`).

### 3. Shelter Management
Tools for shelters to manage their operations and animals.
*   **Pet Inventory:**
    *   **CRUD Operations:** Creating, reading, updating, and deleting pet listings (`AddPetPage`, `PetsManagementPage`).
*   **Application Management:**
    *   **Review:** Viewing incoming applications (`ApplicationsPage`, `ApplicationDetailPage`).
    *   **Decisioning:** Approving or rejecting requests (`ApplicationDetailPage`).
*   **Operations:**
    *   **Meet & Greet:** Scheduling and managing physical meetups (`MeetAndGreetPage`).
    *   **Messaging:** Communicating with applicants (`ShelterMessagesPage`).
    *   **Settings:** Managing shelter specific settings (`SettingsPage`).

### 4. Administration
High-level system oversight.
*   **Dashboard:** Analytics and system health (`AdminDashboard`).
*   **Shelter Oversight:** Viewing and managing registered shelters (`AdminSheltersPage`).
*   **Global Pet Management:** Ability to intervene in pet listings (`AdminAddPetPage`).

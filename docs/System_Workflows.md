# PetMate System Workflows

This document details the operational workflows of the PetMate application.

## 1. Donation Service Workflow
PetMate allows users to support shelters through monetary donations.

```mermaid
sequenceDiagram
    participant User
    participant DonatePage as Donation UI
    participant PaymentGate as Payment Gateway<br>(eSewa/Khalti)
    participant Backend as API Server
    participant DB as Database

    User->>DonatePage: Selects Amount (e.g., NPR 500)
    User->>DonatePage: Selects Payment Method (eSewa)
    User->>DonatePage: Clicks "Donate Now"
    
    DonatePage->>Backend: POST /api/donate<br>{amount, method, userId}
    
    opt Payment Gateway Integration
        Backend->>PaymentGate: Initiate Transaction
        PaymentGate-->>User: Redirect to Login/OTP
        User->>PaymentGate: Authorize Payment
        PaymentGate-->>Backend: Transaction Success Webhook
    end
    
    Backend->>DB: Record Transaction
    DB-->>Backend: Success
    Backend-->>DonatePage: 200 OK (Transaction Complete)
    DonatePage-->>User: Show Success Message<br>"Thank you for your donation!"
```

## 2. Adoption Request Lifecycle
The core feature of PetMate is the adoption process.

```mermaid
stateDiagram-v2
    [*] --> Draft: User starts application
    Draft --> Submitted: User submits form
    
    state "Shelter Review" as Review {
        Submitted --> UnderReview: Shelter opens application
        UnderReview --> MeetAndGreet: Schedule Interview
        MeetAndGreet --> DecisionPending: Interview complete
    }

    DecisionPending --> Approved: Shelter approves
    DecisionPending --> Rejected: Shelter rejects
    
    Approved --> AdoptionFee: Request Payment (Optional)
    AdoptionFee --> Adopted: Payment Confirmed
    Approved --> Adopted: Finalize Transfer
    
    Adopted --> [*]
    Rejected --> [*]
```

## 3. User Authentication Flow
Secure entry points for Adopters and Shelters.

```mermaid
flowchart TD
    Start([User Visits Site]) --> CheckAuth{Is Logged In?}
    
    CheckAuth -- Yes --> RedirectDash[Redirect to Dashboard<br>(Based on Role)]
    CheckAuth -- No --> Landing[Landing Page]
    
    Landing --> LoginClick[Click Login]
    LoginClick --> LoginForm[Login Page]
    
    LoginForm --> InputCreds[Enter Email/Pass]
    InputCreds --> SubmitLogin[Submit]
    
    SubmitLogin --> VerifyCreds{Valid Credentials?}
    
    VerifyCreds -- No --> ErrorMsg[Show Error]
    ErrorMsg --> InputCreds
    
    VerifyCreds -- Yes --> GetProfile[Fetch User Profile]
    
    GetProfile --> CheckVerified{Email Verified?}
    
    CheckVerified -- No --> VerifyPage[Redirect to Verification]
    CheckVerified -- Yes --> RoleCheck{Role?}
    
    RoleCheck -- "Adopter" --> Home[Home Page]
    RoleCheck -- "Shelter" --> SheltDash[Shelter Dashboard]
    RoleCheck -- "Admin" --> AdminDash[Admin Dashboard]
```

## 4. Real-Time Communication
Chat functionality between Adopters and Shelters.

```mermaid
sequenceDiagram
    participant Sender as User A
    participant Socket as Socket.IO Server
    participant Receiver as User B
    participant DB as Message DB

    Sender->>Socket: emit('join_conversation', roomId)
    Receiver->>Socket: emit('join_conversation', roomId)
    
    Note over Sender, Receiver: Connected to Room

    Sender->>Sender: Type Message...
    Sender->>Socket: emit('typing', {roomId, user})
    Socket->>Receiver: on('user_typing')
    
    Sender->>Socket: emit('send_message', {text, roomId})
    Socket->>DB: Save Message (Async)
    
    par Broadcast
        Socket->>Receiver: emit('receive_message', msg)
        Socket->>Sender: ack('message_sent')
    end
```

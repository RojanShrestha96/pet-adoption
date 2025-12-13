# Detailed Sequence Diagrams

This document illustrates the precise sequential interactions between system components.
Flows are categorized by their implementation status to ensure accuracy.

## 1. Authentication Process (Fully Implemented)
**Scenario:** User logs into the system.

```mermaid
sequenceDiagram
    participant User
    participant Client as Frontend (React)
    participant API as Backend (Express)
    participant DB as MongoDB

    User->>Client: Enter Credentials
    User->>Client: Click "Login"
    
    Client->>Client: Validate Form (Zod)
    
    Client->>API: POST /api/auth/login
    
    activate API
    API->>DB: Find User by Email
    DB-->>API: User Document (Hash)
    
    API->>API: Compare Password (Bcrypt)
    
    alt Invalid Credentials
        API-->>Client: 401 Unauthorized
        Client-->>User: Show Error Toast
    else Valid Credentials
        API->>API: Generate JWT
        API-->>Client: 200 OK (Token + UserData)
        
        Client->>Client: Store Token (LocalStorage/Context)
        Client->>Client: Redirect to Dashboard
    end
    deactivate API
```

## 2. Real-Time Messaging (Fully Implemented)
**Scenario:** Adopter sends a message to a Shelter.
**Tech Stack:** Socket.IO + REST Fallback.

```mermaid
sequenceDiagram
    participant Sender as Adopter
    participant ClientA as Adopter Client
    participant Socket as Socket Server
    participant DB as MongoDB
    participant ClientB as Shelter Client
    
    Note over ClientA, ClientB: Users joined Rooms via socket.join()

    Sender->>ClientA: Type & Send Message
    
    par Immediate UI Update
        ClientA->>ClientA: Optimistic UI Update
    and Network Transmission
        ClientA->>Socket: emit('send_message', data)
    end
    
    activate Socket
    
    par Broadcast to Room
        Socket->>ClientB: emit('receive_message', data)
        ClientB->>ClientB: Update Chat Window
    and Notification
        Socket->>ClientB: emit('new_message_notification')
        ClientB->>ClientB: Show Unread Badge
    end
    
    deactivate Socket
    
    Note right of ClientA: Parallel Persistence
    ClientA->>Socket: (Implicitly handled via API in hybrid models)
    
    ClientA->>Socket: POST /api/messages (Fallback/History)
    Socket->>DB: Save Message Document
    DB-->>Socket: Success
```

## 3. Shelter Pet Management (Fully Implemented)
**Scenario:** Shelter adds a new pet to the system.

```mermaid
sequenceDiagram
    participant Shelter
    participant Client as Shelter Dashboard
    participant API as Pet Controller
    participant DB as MongoDB

    Shelter->>Client: Fill Pet Details
    Shelter->>Client: Upload Images
    
    Client->>Client: Prepare FormData
    
    Client->>API: POST /api/pets
    
    activate API
    API->>API: Verify Shelter Token
    
    alt Unauthorized
        API-->>Client: 403 Forbidden
    else Authorized
        API->>DB: Create Pet Document
        DB-->>API: Success (Pet ID)
        API-->>Client: 201 Created
        
        Client-->>Shelter: Show "Pet Added" Toast
        Client->>Client: Refresh Pet Grid
    end
    deactivate API
```

## 4. Adoption Request (Frontend Simulation)
**Scenario:** User applies to adopt a pet.
**Status:** Backend logic is currently mocked on the client side.

```mermaid
sequenceDiagram
    participant User
    participant Client as Frontend (React)
    
    note right of Client: No API Call made (Mock Logic)

    User->>Client: Complete Step 1 (Personal).Next()
    User->>Client: Complete Step 2 (Housing).Next()
    User->>Client: Complete Step 3 (Review).Submit()
    
    activate Client
    Client->>Client: Set Loading State (true)
    Client->>Client: await setTimeout(1500ms)
    Client->>Client: Set Loading State (false)
    
    Client->>Client: Show Success Modal
    User->>Client: Close Modal
    Client->>Client: Navigate to /applications
    deactivate Client
```

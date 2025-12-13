# Comprehensive Activity Diagrams

Detailed activity diagrams split by functional area for readability.

## 1. Authentication Flow (Fully Integrated)
*Status: Backend Fully Implemented*

```mermaid
stateDiagram-v2
    direction TB

    state "User Actions" as User {
        [*] --> EnterCreds : Enter Email/Pass
        EnterCreds --> SubmitLogin : Click Login
    }

    state "Backend Logic" as Server {
        SubmitLogin --> Validate : POST /api/auth/login
        
        state Validate {
            CheckUser : Find User in DB
            VerifyHash : Compare Password (Bcrypt)
            GenToken : Sign JWT
            
            CheckUser --> VerifyHash
            VerifyHash --> GenToken : Valid
            VerifyHash --> Error : Invalid
        }
        
        GenToken --> Response : Return Token
    }

    Response --> Redirect : Store Token & Redirect
    Redirect --> [*]
```

## 2. Adoption Process (Frontend Simulation)
*Status: Frontend Mock Only (Logic Gap)*

```mermaid
stateDiagram-v2
    direction TB

    state "Pet Discovery" as Discovery {
        [*] --> Search : Filter Pets
        Search --> ViewDetail : Select Pet
        ViewDetail --> ClickAdopt : "Adopt Me"
    }

    state "Application Wizard" as Form {
        ClickAdopt --> Step1 : Personal Info
        Step1 --> Step2 : Household Info
        Step2 --> Step3 : Review
        Step3 --> Submit : Submit Application
    }

    state "Simulation" as Logic {
        Submit --> MockDelay : Client Timeout (1.5s)
        MockDelay --> LocalState : Update UI
        LocalState --> SuccessMsg : Show Success Toast
    }

    SuccessMsg --> [*]
```

## 3. Shelter Operations (Fully Integrated)
*Status: Backend Fully Implemented*

```mermaid
stateDiagram-v2
    direction TB

    state "Shelter Admin" as Admin {
        [*] --> FillForm : Enter Pet Details
        FillForm --> UploadPhotos : Select Images
        UploadPhotos --> Post : Submit
    }

    state "API Processing" as API {
        Post --> AuthGuard : Verify Middleware
        
        state "Pet Controller" as Ctrl {
            AuthGuard --> CreateObj : New Pet Model
            CreateObj --> SaveDB : .save()
        }
        
        SaveDB --> SuccessRes : 201 Created
    }

    SuccessRes --> UpdateDash : Refresh List
    UpdateDash --> [*]
```

## 4. Donation Flow (Frontend Simulation)
*Status: Payment Integration Pending*

```mermaid
stateDiagram-v2
    direction TB

    state "User" as User {
        [*] --> ChooseAmt : Select $500/1000
        ChooseAmt --> Confirm : Click Donate
    }

    state "Payment" as Pay {
        Confirm --> PickGateway : Select eSewa/Khalti
        PickGateway --> Alert : Trigger Browser Alert
        
        note right of Alert
            Real SDK integration
            is currently missing
        end note
    }

    Alert --> [*]
```

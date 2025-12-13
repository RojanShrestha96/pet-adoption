# Detailed Entity-Relationship (ER) Diagram

This diagram represents the detailed data schema and relationships of the PetMate system, based on the backend Mongoose models.

```mermaid
erDiagram
    %% USER ENTITY
    USER {
        ObjectId _id PK
        string name "Required"
        string email "Unique, Required"
        string password "Hashed"
        string phone
        string role "adopter|admin"
        string profileImage "URL"
        string address
        boolean isEmailVerified
        string[] favorites "Ref: Pet"
    }

    %% SHELTER ENTITY
    SHELTER {
        ObjectId _id PK
        string name "Required"
        string email "Unique"
        string phone
        string address
        string city
        string state
        string zipCode
        string website
        boolean isVerified
        object operatingHours
        geo location
    }

    %% PET ENTITY
    PET {
        ObjectId _id PK
        string name
        string species "dog|cat|other"
        string breed
        string age
        string gender "male|female"
        string size "small|medium|large"
        string description
        string[] images "URLs"
        boolean isVaccinated
        boolean isNeutered
        string adoptionStatus "available|pending|adopted"
        ObjectId shelter FK
    }

    %% APPLICATION ENTITY (Logical/Implied)
    APPLICATION {
        ObjectId _id PK
        date submittedAt
        string status "pending|approved|rejected"
        object applicantDetails
        object homeEnvironment
        ObjectId pet FK
        ObjectId user FK
        ObjectId shelter FK
    }

    %% CONVERSATION ENTITY
    CONVERSATION {
        ObjectId _id PK
        ObjectId[] participants "Ref: User/Shelter"
        ObjectId lastMessage "Ref: Message"
        date updatedAt
    }

    %% MESSAGE ENTITY
    MESSAGE {
        ObjectId _id PK
        string text
        boolean read
        date createdAt
        ObjectId conversationId FK
        ObjectId sender FK
    }

    %% NOTIFICATION ENTITY
    NOTIFICATION {
        ObjectId _id PK
        string type
        string message
        boolean read
        ObjectId recipient FK
    }

    %% RELATIONSHIPS
    
    %% User Relationships
    USER ||--o{ APPLICATION : submits
    USER ||--o{ NOTIFICATION : receives
    USER }|--o{ PET : favorites
    
    %% Shelter Relationships
    SHELTER ||--o{ PET : owns
    SHELTER ||--o{ NOTIFICATION : receives
    SHELTER ||--o{ APPLICATION : reviews
    
    %% Pet Relationships
    PET ||--o{ APPLICATION : receives
    
    %% Communication Relationships
    USER }|--o{ CONVERSATION : participates
    SHELTER }|--o{ CONVERSATION : participates
    CONVERSATION ||--o{ MESSAGE : contains
    
    %% Logic specific
    APPLICATION }|..|| USER : "1 Applicant"
    APPLICATION }|..|| PET : "1 Target Pet"
```

## Key Improvements
1.  **Full Attribute List:** Added specific fields like `isVaccinated`, `operatingHours`, and `adoptionStatus` derived from the source code.
2.  **Cardinality:** Explicitly marked `1-to-many` (||--o{) and `many-to-many` relationships.
3.  **Logical Entities:** Included `APPLICATION` which connects Users, Pets, and Shelters, essentially acting as the central transaction record.

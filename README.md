# PetMate2

PetMate2 is a comprehensive pet adoption platform designed to connect shelters with potential adopters.

## Features

- **Pet Adoption**: Browse and search for pets available for adoption.
- **Shelter Profiles**: View detailed profiles for animal shelters.
- **Adoption Requests**: Submit and manage adoption applications.
- **User Profiles**: Manage user details and application history.
- **Messaging**: Communicate directly with shelters.

## Project Structure

The project is divided into two main parts:

- **client/**: The frontend React application.
- **server/**: The backend Node.js/Express server.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies for server and client:
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the `server/` directory.
   - Add necessary variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`).

### Running the Application

1. Start the server:
   ```bash
   cd server
   npm start
   ```

2. Start the client:
   ```bash
   cd client
   npm start
   ```

## License

[Add License Here]

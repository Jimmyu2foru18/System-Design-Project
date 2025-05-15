# RecSpicy - Recipe Website

A web application for managing and sharing recipes including user authentication functionality, meal plan creation and recipe creation.

## Prerequisites

We need to have backend requiremet support, install the following:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) 

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Jimmyu2foru18/System-Design-Project.git
cd System-Design-Project
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
   - Create a `.env` file in the root directory
   - Add the environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for testing and development.

### Production Mode
```bash
npm start
```

## Features

- User Authentication - Login/Register
- Google Authentication 
- Recipe Management
- File Upload Support
- RESTful API

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google Auth
- **File Handling**: Multer, Express-fileupload
- **Development**: Nodemon

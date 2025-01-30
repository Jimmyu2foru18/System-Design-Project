# Recipe Index - System Design Project

## Project Overview

This project is a dynamic recipe index website that allows users to browse, save, rate, and post recipes. 
Our focus is to provide improved user experience, fast performance, and strong security while creating a engaging,
simple and useful in feature experience for the end user.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Testing](#testing)
- [Known Issues](#known-issues)

## Technologies Used

### Front-End
- HTML5, CSS3, JavaScript
- Tailwind CSS
- React.js (optional future enhancement)

### Back-End
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- Redis (caching)
- AWS Services

### Infrastructure
- AWS S3 (storage)
- AWS CloudFront (CDN)
- AWS EC2 (hosting)
- AWS RDS (database)
- AWS Lambda (serverless functions)

## Project Structure
```bash
project-root/
│
├── index.html         # Main entry point
├── styles.css         # Global styles
├── app.js             # Client-side JavaScript
├── server.js          # Express server setup
├── db.js              # Database configuration
├── schema.sql         # Database schema
├── auth.js            # Authentication logic
├── config.js          # Configuration settings
├── middleware.js      # Custom middleware
├── utils.js           # Utility functions
│── Recipe.js          # Recipe model
│── User.js            # User model
│── aws.service.js     # AWS integration
│── email.service.js   # Email service
│── api.test.js        # API tests
│── unit.test.js       # Unit tests
│── schemas.js         # Validation schemas

└── .env               # Environment variables
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Fill in required credentials

4. Set up the database:
```bash
psql -U your_username -d your_database -f schema.sql
```

5. Start the development server:
```bash
npm run dev
```

## Usage

[Instructions on how to use the Website]



## Features

- User authentication and authorization
- Recipe CRUD operations
- Search and filtering functionality
- Rating and favorite system
- Image upload and management
- Email notifications
- Responsive design



## API Documentation

[To be completed as endpoints are developed]



## Database Schema

Currently implemented tables:
- Users: Store user information and authentication data
- Recipes: Contains recipe details and user-generated content



[Full schema details to be added as development progresses]



## Contributing

- James McGuigan (https://github.com/Jimmyu2foru18/)
- Steven Foster (https://github.com/Silver-mark/)

## Testing

Run tests with:
```bash
npm test
```

## Known Issues

[To be documented as development progresses]


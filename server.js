/*
Main Express server file
Will handle:
- Server setup
- Middleware configuration
- Route management
- Database connection
- Authentication logic
*/

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());

// Routes will be imported here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
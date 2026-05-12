import dotenv from 'dotenv';
// Load environment variables based on node environment or default to local .env
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : './src/.env' });

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

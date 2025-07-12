const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); 

dotenv.config();

const app = express();

// connect to MongoDB
const connectDB = require('./config/db');
connectDB(); 

app.use(express.json());
app.use('/api/auth', authRoutes);



app.listen(process.env.PORT || 5000, () => {
      console.log('Server running');
    });

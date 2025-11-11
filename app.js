require('dotenv').config();
const express = require('express');
const app = express();
const { sequelize } = require('./src/models');
const cors = require('cors');
const path = require('path');

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://petshopzn-fe.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // kalau frontend kirim cookie atau token
}));
app.use('/', require('./src/routes'));
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// Sinkronisasi DB & Start server
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database synced');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('❌ Unable to connect to database:', err));

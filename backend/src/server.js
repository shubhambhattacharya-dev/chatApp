import expres from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';

dotenv.config({ path: '../.env' });
connectDB();



const app = expres();

// Middleware for parsing JSON
app.use(expres.json());
app.use(expres.urlencoded({ extended: true }));

const port =process.env.PORT || 8000;

app.use('/api/auth',authRoutes);

app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
    
})
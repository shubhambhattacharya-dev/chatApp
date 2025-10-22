import expres from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';


dotenv.config();

const app=expres();

const port =process.env.PORT || 8000;

app.use('/api/auth',authRoutes);

app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})
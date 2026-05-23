import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db_connect.js';
import categoryRoutes from './routes/category.route.js'
import authRoutes from './routes/auth.route.js'
import emailRoutes from './routes/email.route.js'
import mlRoutes from './routes/ml.route.js'

dotenv.config();
const app = express();
connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/ml", mlRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Server is running on port : ",PORT)
})


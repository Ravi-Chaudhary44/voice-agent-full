import app from './app.js';
import {db_name} from './constants.js';
import mongoose from 'mongoose';
import connectDB from './db/db1.js';
import dotenv from 'dotenv';

dotenv.config({
    path:'./.env'
}
)
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
          console.log(`server is running at port: ${process.env.PORT || 8000}`);
    })
})
.catch((error)=>{
    console.log("mongo connection failed",error);
})
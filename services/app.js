import express from 'express';
import connectToDatabase from './api/db/connection.js';
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import user from './api/routes/admin/admin.routes.js'
import product from './api/routes/product/product.routes.js'
import dotenv from 'dotenv';

dotenv.config({
    path:"D:/cake-shop/server/services/api/config/config.env"
});


const app = express()
const allowedOrigins = [
  process.env.REACT_LOCAL_CLIENT_URL,
  process.env.REACT_LOCAL_CLIENT_DASHBOARD_URL
];

console.log("Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Request Origin:", origin);
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)

    if (allowedOrigins.includes(origin)) {
      console.log("Origin Allowed:", origin);
      callback(null, true);
    } else {
      console.log("Origin Not Allowed:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// For preflight requests (OPTIONS method)
app.options('*', cors(corsOptions));

// For handling non-preflight requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("Request Origin (Middleware):", origin);
  if (allowedOrigins.includes(origin)) {
    console.log("Origin Allowed (Middleware):", origin);
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  return next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))


connectToDatabase()

app.use("/api/v1",user)
app.use("/api/v1/product",product)




export default app
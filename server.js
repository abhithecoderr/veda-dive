import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import expressEjsLayouts from "express-ejs-layouts";
import indexRouter from './routes/index.js';
import readRouter from './routes/read.js';
import insightsRouter from './routes/insights.js';
import searchRouter from './routes/search.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();
const port = process.env.PORT ;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressEjsLayouts);
// Tell the layout engine where to find the master layout file
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', indexRouter);
app.use('/read', readRouter);
app.use('/insights', insightsRouter);
app.use(searchRouter);

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
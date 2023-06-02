const express = require("express");
const connectToDB = require("./config/connectToDb");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require ("cors");// el backend  byshtghl aa localhost 5000 wl front aa 3000 mishn heik waet bde eje ekhud data mn l back ma byaetiya laan el front yu3tabar local khareje mishn heik ana bhajje al cros
require("dotenv").config();


//connection to DB
connectToDB();

//init app
const app = express();

//Midlewares
//bikhali el middlewares mn el express js bikhali el express yaerf el json file yale bteje mn l client
app.use(express.json());

//cors policy
app.use(cors({
  origin : "http://localhost:3000"
})); // hon yaene ana am elu aete service  la hyda el domain 

//Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));

// Error handler Middleware
app.use(notFound);
app.use(errorHandler);

//Running the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(
    `server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

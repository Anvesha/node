import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./route/user.route.js";

const app = express();


app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 4000;
const URI = process.env.MongodbURI;

// connect to mongoDB
try {
    mongoose.connect(URI);
    console.log("Connected to mongoDB");
} catch (error) {
    console.log("Error: ", error);
}

// defining routes
app.use("/user", userRoute);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
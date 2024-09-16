import express from "express"
import cors from "cors";
// import cookieParser from "cookie-parser";

import path from "path";
import connectDB from "./config/db";
import { admin, client, therapist } from "./routes";
import { checkValidAdminRole } from "./utils";

const app = express()
const PORT = process.env.PORT || 8000;
app.set("trust proxy", true);

// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        credentials: true,
        // allowedHeaders: ["Content-Type", "Authorization"],
    })
)

var dir = path.join(__dirname, 'static');
app.use(express.static(dir));

var uploadsDir = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(uploadsDir));

connectDB()

app.get("/", (req: any, res: any) => {
    res.send("hello world");
});

app.use("/api/admin", checkValidAdminRole,  admin)
app.use("/api/therapist", therapist)
app.use("/api/client", client)


app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
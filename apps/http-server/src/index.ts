import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
// import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common";
import { prisma } from "@repo/db"
import cors from "cors";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
app.use(cors())

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    const hashpassword = await bcrypt.hash(parsedData.data.password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                email: parsedData.data?.username,
                password: hashpassword,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

// app.post('/signin', async (req, res) => {

// })

app.listen(8000, () => {
    console.log("server is running on the port 8000...");
})
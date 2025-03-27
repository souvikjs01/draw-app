import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';
// import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common";
import { prisma } from "@repo/db"
import cors from "cors";
import bcrypt from "bcryptjs";
import middleware from "./middleware.js";

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


app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    // TODO: Compare the hashed pws here
    const user = await prisma.user.findUnique({
        where: {
            email: parsedData.data.username,
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Invalid credintials"
        })
        return;
    }

    const validPassword = await bcrypt.compare(parsedData.data.password, user.password)
    if (!validPassword) {
        res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET)

    res.json({ message: "Login successful!", token });
})

app.post('/room', middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    
    const userId = req.userId ?? ""
    try {
        const room = await prisma.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.status(200).json({
            roomId: room.id
        })
    } catch (error) {
        console.log("error " + error);
        res.status(411).json({
            message: "Room already exists with the name"
        })
    }
})

app.get("/chats/:roomId", async (req, res) => {
    const roomId = parseInt(req.params.roomId, 10);
    if (isNaN(roomId)) {
        res.status(400).json({ message: "Invalid room ID" });
    }    
    try {
        const roomChats = await prisma.chat.findMany({
            where: {
                roomId,
            },
            orderBy: {
                id: "desc"
            },
            take: 50  
        }) 
        if (roomChats.length === 0) {
            res.status(404).json({ message: "No messages found" });
            return
        }

        res.status(200).json({ roomChats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ message: "Internal server error", roomChats: [] });
    }
    
})

app.listen(8000, () => {
    console.log("server is running on the port 8000...");
})
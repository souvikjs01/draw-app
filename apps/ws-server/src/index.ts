import { WebSocket, WebSocketServer} from "ws"
import { JWT_SECRET } from '@repo/backend-common';
import Jwt, { JwtPayload } from "jsonwebtoken";
const wss = new WebSocketServer({ port: 8080 })
import { prisma } from "@repo/db";


interface User {
    ws: WebSocket
    rooms: string[],
    userId: string
}
const users : User[] = [];

function checkUser(token: string) {
    try {
        const decoded = Jwt.verify(token, JWT_SECRET) as JwtPayload

        if(typeof decoded === "string") {
            return null
        }
        if(!decoded || !decoded.userId) {
            return null
        }

        return decoded.userId
    } catch (error) {
        return null
    }
}

wss.on("connection", function connection(ws, request) {
    const url = request.url
    if(!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1])
    const token = queryParams.get('token') || ""
    const userId = checkUser(token)

    if(userId == null) {
        ws.close();
        return null
    }

    users.push({
        userId,
        rooms: [],
        ws,
    })

    ws.on("message", async (data) => {
        let parsedData;
        if(typeof data !== "string") {
            parsedData = JSON.parse(data.toString())
        } else {
            parsedData = JSON.parse(data)
        }

        if(parsedData.type === "join_room") {
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(parsedData.roomId)
        }

        if(parsedData.type === "leave_room") {
            const user = users.find(x => x.ws === ws)
            if(!user) {
                return;
            }
            user.rooms = user.rooms.filter(x => x === parsedData.roomId)
        }

        console.log("message received")
        console.log(parsedData);

        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            
            try {
                await prisma.chat.create({
                    data: {
                      roomId: Number(roomId),
                      message,
                      userId
                    }
                });

                users.forEach(user => {
                    if (user.rooms.includes(roomId)) {
                      user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                      }))
                    }
                })
            } catch (error) {
                console.log("something went wrong " + error);
                return                
            }
        }
    })

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
    });
    
})
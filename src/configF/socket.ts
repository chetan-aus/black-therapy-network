import { MessageModel } from "../models/chat-message-schema";

export default function socketHandler(io: any) {
    io.on('connection', (socket: any) => {
        console.log('A user connected');

        // Handling disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });

        // Listen for 'message' event when a new message is sent
        socket.on('message', async (payload: any) => {
            const { sender, roomId, message, attachment } = payload

            // Create a new message document and save it
            try {
                const newMessage = new MessageModel({
                    sender,
                    roomId,
                    message,
                    attachment
                });

                await newMessage.save();

                // Broadcast the message to all clients in the room
                io.to(roomId).emit('message', { 
                    sender, 
                    message, 
                    timestamp: newMessage.timestamp, 
                    attachment 
                })
            } catch (error) {
                console.error('Failed to save message:', error);
            }
        });

        // Join a room based on roomId (coming from frontend)
        socket.on('joinRoom', (roomId: string) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });
    });
}

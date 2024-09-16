const fs = require('fs');
const path = require('path');

function getLastNLines(n, filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }

            const lines = data.trim().split('\n');
            const lastNLines = lines.slice(-n);
            resolve(lastNLines);
        });
    });
}

module.exports = (io) => {
    io.use((socket, next) => {
        const session = socket.request.session;
        if (session && session.isAdmin) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', async (socket) => {
        console.log('A new user connected');

        const session = socket.request.session;
        if (session && session.username) {
            console.log(`User connected with session: ${session.username}`);

            socket.on('requestInitialLogs', async (callback) => {
                try {
                    const logs = await getLastNLines(1000, path.join(__dirname, 'combined.log'));
                    callback(logs);
                } catch (err) {
                    console.error('Error fetching logs:', err);
                    callback([]);
                }
            });

            socket.on('chatMessage', (msg) => {
                console.log(`Message from ${session.username}: ${msg}`);
                io.emit('chatMessage', { user: session.username, message: msg });
            });

            socket.on('disconnect', () => {
                console.log(`${session.username} disconnected`);
                socket.broadcast.emit('message', `${session.username} has left the chat`);
            });
        } else {
            console.log('Unauthenticated user tried to connect');
            socket.emit('error', 'Unauthorized');
            socket.disconnect();
        }
    });
};

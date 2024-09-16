document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const logsContainer = document.getElementById('logs');

    function addLog(log) {
        const logEntry = document.createElement('div');
        logEntry.textContent = log;
        logsContainer.appendChild(document.createElement('hr'));
        logsContainer.appendChild(logEntry);

        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    socket.on('logs', (logs) => {
        logs.forEach(log => addLog(log));
    });

    socket.on('chatMessage', (data) => {
        addLog(`${data.user}: ${data.message}`);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const logsContainer = document.getElementById('logs');
    let initialLogsLoaded = false;

    function addLog(log) {
        const logEntry = document.createElement('div');
        logEntry.textContent = log;
        logsContainer.appendChild(document.createElement('hr'));
        logsContainer.appendChild(logEntry);

        logsContainer.lastElementChild.scrollIntoView();
    }

    function addInitialLogs(logs) {
        const fragment = document.createDocumentFragment();
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.textContent = log;
            fragment.appendChild(document.createElement('hr'));
            fragment.appendChild(logEntry);
        });
        logsContainer.appendChild(fragment);
        logsContainer.lastElementChild.scrollIntoView();
    }

    function subscribeToLogs() {
        socket.on('logs', handleLogs);
        socket.on('chatMessage', handleChatMessage);
    }

    function unsubscribeFromLogs() {
        socket.off('logs', handleLogs);
        socket.off('chatMessage', handleChatMessage);
    }

    function handleLogs(logs) {
        if (!initialLogsLoaded) {
            addInitialLogs(logs);
            initialLogsLoaded = true;
        } else {
            logs.forEach(log => addLog(log));
        }
    }

    function handleChatMessage(data) {
        addLog(`${data.user}: ${data.message}`);
    }

    function requestInitialLogs() {
        socket.emit('requestInitialLogs', (initialLogs) => {
            handleLogs(initialLogs);
        });
    }

    document.getElementById('v-pills-six-logs-tab').addEventListener('shown.bs.tab', () => {
        if (!initialLogsLoaded) {
            requestInitialLogs();
        }
        subscribeToLogs();
    });

    document.getElementById('v-pills-six-logs-tab').addEventListener('hidden.bs.tab', () => {
        unsubscribeFromLogs();
    });
});

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let clientID = 1;
const clients = new Map();

function broadcast(message, sender = null) {
  for (let [client, username] of clients) {
    if (client.readyState === WebSocket.OPEN && client !== sender) {
      client.send(JSON.stringify(message));
    }
  }
}

server.on('connection', (ws) => {
  const username = `Usuario_${clientID++}`;
  clients.set(ws, username);

  ws.send(JSON.stringify({ type: 'welcome', username }));
  broadcast({ type: 'notification', message: `${username} se ha unido al chat.` }, ws);

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    const sender = clients.get(ws);
    broadcast({ type: 'message', username: sender, text: message.text });
  });

  ws.on('close', () => {
    const username = clients.get(ws);
    clients.delete(ws);
    broadcast({ type: 'notification', message: `${username} se ha desconectado.` });
  });
});

console.log('Servidor WebSocket activo en ws://localhost:8080');
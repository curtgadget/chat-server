// Socket chat server
// requirements can be found in the following 2 gists
// https://gist.github.com/curtgadget/1daa9c5a59fd33ac343854eba9275044
// https://gist.github.com/curtgadget/6fd8f3119037e1b265d518d7b3014f11

const net = require('net');
const connections = [];

// Create chat server
const chatServer = net.createServer(connection => {
  connection.setEncoding('utf8');

  // Greeting
  connection.write('Welcome to my chat server! Select a username.\n');

  connection.on('data', data => {
    if (connection.username) {
      broadcast(data, connection);
    } else {
      // Assume user is trying to set username if its not yet set
      let userFound = false;
      connections.forEach(c => {
        if (c.username === data.trim()) {
          userFound = true;
        }
      });

      if (!userFound) {
        // Set username
        connection.username = data.trim();

        // Send greeting
        connection.write(greeting(connection));
        broadcast(`*${connection.username} has joined the chat*\n`, connection, true);
      } else {
        connection.write('Username is already taken. Please try again\n');
      }
    }
  })

  // Add to the connections array
  connections.push(connection);

  connection.on('end', () => {
    // Remove connection from list
    connections.splice(connections.indexOf(connection), 1);
    broadcast(`*${connection.username} has left the chat*\n`, connection, true);
  });
})

const broadcast = (message, sender, status = false) => {
  let broadcastMessage = status ? message : `${sender.username}: ${message}`;
  connections.forEach(c => {
    if (c !== sender) {
      c.write(broadcastMessage);
    }
  })
}

const greeting = (newConnection) => {
  let numOfConnections = connections.length - 1;
  let connectedUsers = [];

  connections.forEach(c => {
    if (c !== newConnection) {
      connectedUsers.push(c.username);
    }
  })

  const connectedUsersString = '[' + connectedUsers.join(', ') + ']';

  return numOfConnections === 0 ? `You are the first one here!\n` : `You are connected with ${numOfConnections} other users: ${connectedUsersString}\n`;
}

chatServer.on('error', err => {
  console.log('poop');
  throw err;
});

chatServer.listen(6000, () => {
  console.log('Server listening...');
})

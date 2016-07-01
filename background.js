'use strict';

var socket = null;

var connect = data => {
  const remote = data.remote;
  socket = new WebSocket(remote);

  self.postMessage({
    action: 'status',
    data: `status: ${socket.readyState}`
  });

  socket.onerror = (e) => {
    self.postMessage({
      action: 'status',
      data: `error: ${e.stack}`
    });
  };

  socket.onopen = () => {
    self.postMessage({
      action: 'status',
      data: `onopen: ${socket.readyState}`
    });
  };

  socket.onclose = () => {
    self.postMessage({
      action: 'status',
      data: `onclose: ${socket.readyState}`
    });
  };

  socket.onmessage = message => {
    self.postMessage({
      action: 'message',
      data: message.data
    });
  };
};

self.addEventListener('message', message => {
  const data = message.data;

  if (data.action === 'connect') {
    connect(data.data);
  } else {
    socket.send(data.data);
  }
}, false);

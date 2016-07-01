'use strict';

const worker = new Worker('background.js');

var $ = document.querySelector.bind(document);

const getUrlParams = k => {
  const params = {};
  const url = location.href;
  const idx = url.indexOf('?');

  if (idx > 0) {
    const queryStr = url.substring(idx + 1);
    const args = queryStr.split('&');

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const nv = args[i] = a.split('=');
      params[nv[0]] = nv.length > 1 ? nv[1] : true;
    }
  }
  return params[k];
};

const bindEvent = function(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler, false);
  } else {
    el.attachEvent('on' + eventName, function(){
      handler.call(el);
    });
  }
};

const getRemote = () => {
  var server = getUrlParams('server') || 'ws://localhost:5678/';

  if (!~server.indexOf('ws://')) {
    server = `ws://${server}`;
  }

  changeStatus(`get remote: ${server}`);
  return server;
};

const changeStatus = log => {
  $('#status').innerHTML = log;
};

worker.postMessage({
  action: 'connect',
  data: {
    remote: getRemote()
  }
});

bindEvent($('#send'), 'click', (e) => {
  const data = {
    name: $('#name').value,
    message: $('#message').value,
    date: new Date()
  };

  const jsonstring = JSON.stringify(data);

  worker.postMessage({
    action: 'message',
    data: jsonstring
  });

  $('#message').value = '';
});

bindEvent(worker, 'message', message => {
  changeStatus('message arrived');

  var data = message.data;


  if (data.action === 'message') {
    data = JSON.parse(data.data);
    const color = $('#name').value === data.name ? 'red' : 'blue';
    const item = `<li><i style="color: ${color}">${data.name}</i>[${data.date}]<br>${data.message}</li>`;
    $('#history').innerHTML += item;
  } else if (data.action === 'status') {
    changeStatus(data.data)
  }
});

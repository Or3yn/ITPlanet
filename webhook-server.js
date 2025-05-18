const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const path = require('path');

// Секретный ключ для верификации webhook'а
const SECRET = 'itplanet3dev-webhook-secret-2025'; // Секретный ключ для itplanet3dev.ru

// Путь к скрипту деплоя
const DEPLOY_SCRIPT = path.join(__dirname, 'deploy.bat');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    // Проверяем content type
    const contentType = req.headers['content-type'];
    if (contentType !== 'application/json') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid content type. Expected application/json' }));
      return;
    }

    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Проверяем подпись от GitHub
      const signature = req.headers['x-hub-signature-256'];
      if (!signature) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No signature' }));
        return;
      }

      const hmac = crypto.createHmac('sha256', SECRET);
      const digest = 'sha256=' + hmac.update(body).digest('hex');

      if (signature !== digest) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid signature' }));
        return;
      }

      try {
        const payload = JSON.parse(body);
        
        // Проверяем, что это push в ветку master
        if (payload.ref === 'refs/heads/master') {
          console.log('Received push to master, deploying...');
          
          // Запускаем скрипт деплоя
          exec(`"${DEPLOY_SCRIPT}"`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Deploy error: ${error}`);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Deploy failed', details: error.message }));
              return;
            }
            console.log(`Deploy output: ${stdout}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Deploy started successfully' }));
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Not a push to master' }));
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload', details: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
}); 
const http2 = require('http2');
const dns = require('dns');
const dnsPacket = require('dns-packet');
const fs = require('fs');

const options = {
  hostname: 'localhost',
  port: 443,
  path: '/dns-query',
  method: 'POST',
  rejectUnauthorized: false, // Don't verify certificate
  headers: {
    'Content-Type': 'application/dns-message',
    'Accept': 'application/dns-message'
  }
};

async function resolveDOH(domain) {
  const question = {
    name: domain,
    type: 'A',
    class: 'IN'
  };

  const query = {
    id: 1,
    type: 'query',
    flags: 0,
    questions: [question]
  };

  const dnsMessage = dnsPacket.encode(query);

  const client = http2.connect(`https://${options.hostname}:${options.port}`, {
    rejectUnauthorized: false, // disable certificate verification
  });

  client.on('error', (err) => console.error(err));

  const req = client.request({
    ':path': options.path,
    ':method': options.method,
    'content-type': options.headers['Content-Type'],
    'accept': options.headers['Accept']
  });

  req.on('response', (headers, flags) => {
    // console.log('headers', headers);
  });

  req.write(dnsMessage);
  req.end();

  let data = [];
  req.on('data', (chunk) => {
    data.push(chunk);
  });

  req.on('end', () => {
    try {
      const buffer = Buffer.concat(data);
      const decoded = dnsPacket.decode(buffer);
      console.log('DoH query result:', decoded);
    } catch (e) {
      console.error('Error parsing DNS response:', e);
    } finally {
      client.close();
    }
  });
}

resolveDOH('yahoo.com');

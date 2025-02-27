const tls = require('tls');
const dnsPacket = require('dns-packet');

const options = {
  host: 'localhost',
  port: 853,
  rejectUnauthorized: false // Don't verify certificate
};

async function resolveDOT(domain) {
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
  const messageLength = Buffer.alloc(2);
  messageLength.writeUInt16BE(dnsMessage.length, 0);
  const dotMessage = Buffer.concat([messageLength, dnsMessage]);

  const socket = tls.connect(options, () => {
    console.log('Connected to DoT server');
    socket.write(dotMessage);
  });

  let receivedData = Buffer.alloc(0);

  socket.on('data', (data) => {
    receivedData = Buffer.concat([receivedData, data]);

    // Check if we have received the complete DNS message
    if (receivedData.length > 2) {
      const expectedLength = receivedData.readUInt16BE(0);
      if (receivedData.length >= expectedLength + 2) {
        const dnsResponse = receivedData.slice(2, expectedLength + 2);
        try {
          const decoded = dnsPacket.decode(dnsResponse);
          console.log('DoT query result:', decoded);
        } catch (e) {
          console.error('Error parsing DNS response:', e);
        } finally {
          socket.end();
        }
      }
    }
  });

  socket.on('end', () => {
    console.log('Disconnected from DoT server');
  });

  socket.on('error', (err) => {
    console.error('Error:', err);
  });
}

resolveDOT('yahoo.com');

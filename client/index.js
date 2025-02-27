const dns = require('dns');


const options = {
  family: 4,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
  all: true,
  dohPort: 443,
  dnsPort: 5053,
  server: '127.0.0.1'
};


function resolveDNS(domain) {
  dns.setServers([`${options.server}:${options.dnsPort}`]);
  dns.resolve(domain, 'A', (err, addresses) => {
    if (err) {
      console.error('DNS query failed:', err);
    } else {
      console.log('DNS query result:', addresses);
    }
  });
}


resolveDNS('yahoo.com');

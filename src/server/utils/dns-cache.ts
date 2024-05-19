import * as http from "http";
import * as https from "https";
import CacheableLookup from "./DnsCache";

import dns from "dns";
try {
  const existingServers = dns.getServers();
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", ...existingServers]);
} catch (e) {
  console.error(e);
}

const cacheable = new CacheableLookup({
  maxTtl: 60 * 60, // 1 hour
});

cacheable.install(http.globalAgent);
cacheable.install(https.globalAgent);

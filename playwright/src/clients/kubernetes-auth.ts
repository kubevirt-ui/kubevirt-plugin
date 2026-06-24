import * as fs from 'fs';
import * as https from 'https';
import * as net from 'net';
import * as path from 'path';
import { URL } from 'url';

import type * as http from 'http';
import type * as stream from 'stream';

export function getProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
  );
}

export function createProxyAgent(proxyUrl: string): https.Agent {
  const proxy = new URL(proxyUrl);

  return new https.Agent({
    rejectUnauthorized: false,
    createConnection: (
      options: http.ClientRequestArgs,
      callback: (err: Error | null, stream: stream.Duplex) => void,
    ) => {
      const proxySocket = net.connect(
        {
          host: proxy.hostname,
          port: parseInt(proxy.port || '3128', 10),
        },
        () => {
          const connectReq = [
            `CONNECT ${options.host}:${options.port} HTTP/1.1`,
            `Host: ${options.host}:${options.port}`,
            'Connection: keep-alive',
            '',
            '',
          ].join('\r\n');
          proxySocket.write(connectReq);
        },
      );

      let responseData = '';
      const onData = (chunk: Buffer) => {
        responseData += chunk.toString();

        if (responseData.includes('\r\n\r\n')) {
          proxySocket.removeListener('data', onData);
          const [statusLine] = responseData.split('\r\n');
          const statusCode = parseInt(statusLine.split(' ')[1], 10);

          if (statusCode === 200) {
            callback(null, proxySocket);
          } else {
            const error = new Error(
              `Proxy CONNECT failed with status ${statusCode}: ${statusLine}`,
            );
            proxySocket.destroy();
            callback(error, undefined as unknown as stream.Duplex);
          }
        }
      };

      proxySocket.on('data', onData);
      proxySocket.on('error', (err) => {
        callback(err, undefined as unknown as stream.Duplex);
      });
    },
  } as https.AgentOptions);
}

async function getOAuthServerUrl(clusterUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const url = new URL('/.well-known/oauth-authorization-server', clusterUrl);
    const proxyUrl = getProxyUrl();
    const agent = proxyUrl ? createProxyAgent(proxyUrl) : undefined;

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      rejectUnauthorized: false,
      agent,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const config = JSON.parse(body);
          resolve(config.issuer || clusterUrl);
        } catch {
          resolve(clusterUrl);
        }
      });
    });

    req.on('error', () => {
      resolve(clusterUrl);
    });

    req.end();
  });
}

export async function getOAuthToken(
  clusterUrl: string,
  username: string,
  password: string,
): Promise<string> {
  const oauthServerUrl = await getOAuthServerUrl(clusterUrl);

  return new Promise((resolve, reject) => {
    const authHeader = Buffer.from(`${username}:${password}`).toString('base64');
    const tokenUrl = new URL('/oauth/authorize', oauthServerUrl);
    tokenUrl.searchParams.set('response_type', 'token');
    tokenUrl.searchParams.set('client_id', 'openshift-challenging-client');

    const proxyUrl = getProxyUrl();
    const agent = proxyUrl ? createProxyAgent(proxyUrl) : undefined;

    const options: https.RequestOptions = {
      hostname: tokenUrl.hostname,
      port: tokenUrl.port || 443,
      path: tokenUrl.pathname + tokenUrl.search,
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'X-CSRF-Token': '1',
      },
      rejectUnauthorized: false,
      agent,
    };

    const req = https.request(options, (res) => {
      const location = res.headers.location;
      if (location && location.includes('access_token=')) {
        const match = location.match(/access_token=([^&]+)/);
        if (match) {
          resolve(match[1]);
          return;
        }
      }

      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        reject(
          new Error(
            `OAuth authentication failed: HTTP ${res.statusCode}. Response: ${body.substring(
              0,
              200,
            )}`,
          ),
        );
      });
    });

    req.on('error', (err) => {
      reject(new Error(`OAuth request failed: ${err.message}`));
    });

    req.end();
  });
}

export async function generateKubeconfig(
  clusterUrl: string,
  username: string,
  password: string,
  outputPath: string,
): Promise<string> {
  const token = await getOAuthToken(clusterUrl, username, password);

  const kubeconfigYaml = `apiVersion: v1
kind: Config
clusters:
  - name: cluster
    cluster:
      server: ${clusterUrl}
      insecure-skip-tls-verify: true
contexts:
  - name: context
    context:
      cluster: cluster
      user: user
current-context: context
users:
  - name: user
    user:
      token: ${token}
`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, kubeconfigYaml, 'utf8');
  return outputPath;
}

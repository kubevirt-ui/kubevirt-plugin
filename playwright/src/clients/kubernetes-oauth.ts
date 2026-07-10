import * as fs from 'fs';
import * as https from 'https';
import * as net from 'net';
import * as path from 'path';
import { URL } from 'url';

import type { Duplex } from 'stream';

import { getKubernetesProxyUrl } from './kubernetes-proxy';

/** HTTPS agent that CONNECT-tunnels through an HTTP proxy (IPv6 / proxy CI jobs). */
export function createKubernetesConnectProxyAgent(proxyUrl: string): https.Agent {
  const proxy = new URL(proxyUrl);

  return new https.Agent({
    rejectUnauthorized: false,
    createConnection: (options, callback) => {
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
            callback(null, proxySocket as Duplex);
          } else {
            const error = new Error(
              `Proxy CONNECT failed with status ${statusCode}: ${statusLine}`,
            );
            proxySocket.destroy();
            callback(error, undefined);
          }
        }
      };

      proxySocket.on('data', onData);
      proxySocket.on('error', (err) => {
        callback(err instanceof Error ? err : new Error(String(err)), undefined);
      });
    },
  } as https.AgentOptions);
}

async function getOAuthServerUrl(clusterUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const url = new URL('/.well-known/oauth-authorization-server', clusterUrl);

    const proxyUrl = getKubernetesProxyUrl();
    const agent = proxyUrl ? createKubernetesConnectProxyAgent(proxyUrl) : undefined;

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

/** Exchange OpenShift username/password for an OAuth bearer token (proxy-aware). */
export async function getOpenshiftOAuthToken(
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

    const proxyUrl = getKubernetesProxyUrl();
    const agent = proxyUrl ? createKubernetesConnectProxyAgent(proxyUrl) : undefined;

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

/** Write a kubeconfig file using a token from {@link getOpenshiftOAuthToken}. */
export async function generateOpenshiftKubeconfig(
  clusterUrl: string,
  username: string,
  password: string,
  outputPath: string,
): Promise<string> {
  const token = await getOpenshiftOAuthToken(clusterUrl, username, password);

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

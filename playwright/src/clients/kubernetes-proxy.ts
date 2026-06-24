import * as net from 'net';
import * as tls from 'tls';
import { URL } from 'url';
import * as zlib from 'zlib';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import type * as k8s from '@kubernetes/client-node';

/**
 * Proxy URL from environment (HTTPS_PROXY / HTTP_PROXY), shared by KubernetesClient and handlers.
 */
export function getKubernetesProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
  );
}

function decodeHttpChunkedPayload(payload: string): string {
  let pos = 0;
  let result = '';
  while (pos < payload.length) {
    const lineEnd = payload.indexOf('\r\n', pos);
    if (lineEnd === -1) {
      break;
    }
    const sizeLine = (payload.slice(pos, lineEnd).split(';')[0] ?? '').trim();
    const chunkSize = parseInt(sizeLine, 16);
    if (Number.isNaN(chunkSize)) {
      break;
    }
    if (chunkSize === 0) {
      break;
    }
    pos = lineEnd + 2;
    result += payload.slice(pos, pos + chunkSize);
    pos += chunkSize;
    if (payload.slice(pos, pos + 2) !== '\r\n') {
      break;
    }
    pos += 2;
  }
  return result;
}

function normalizeProxyResponseBody(headerSection: string, rawBody: string): string {
  const headersLower = headerSection.toLowerCase();
  let bodyText = rawBody;
  if (headersLower.includes('transfer-encoding: chunked')) {
    bodyText = decodeHttpChunkedPayload(bodyText);
  }
  if (headersLower.includes('content-encoding: gzip')) {
    bodyText = zlib.gunzipSync(Buffer.from(bodyText, 'binary')).toString('utf8');
  }
  return bodyText;
}

/**
 * Raw Kubernetes API request through HTTP CONNECT proxy (IPv6 / proxy-only jobs).
 */
export async function makeKubernetesProxyRequest(
  kubeConfig: k8s.KubeConfig,
  method: string,
  apiPath: string,
  body?: unknown,
): Promise<KubernetesResource | null> {
  const proxyUrl = getKubernetesProxyUrl();
  const cluster = kubeConfig.getCurrentCluster();
  const user = kubeConfig.getCurrentUser();

  if (!cluster || !user) {
    throw new Error('No current cluster or user context in kubeconfig');
  }

  const u = user as k8s.User & {
    authProvider?: { config?: Record<string, string | undefined> };
    certData?: string;
    keyData?: string;
  };
  const token = u.token || u.authProvider?.config?.['access-token'];
  const certData = u.certData;
  const keyData = u.keyData;

  let clientCert: Buffer | undefined;
  let clientKey: Buffer | undefined;
  if (certData && keyData) {
    clientCert = Buffer.from(certData, 'base64');
    clientKey = Buffer.from(keyData, 'base64');
  }

  const apiUrl = new URL(apiPath, cluster.server);
  const targetHost = apiUrl.hostname;
  const targetPort = parseInt(apiUrl.port, 10) || 443;

  if (!proxyUrl) {
    throw new Error('No proxy configured for IPv6 cluster connection');
  }

  return new Promise((resolve, reject) => {
    const proxy = new URL(proxyUrl);

    const proxySocket = net.connect(
      {
        host: proxy.hostname,
        port: parseInt(proxy.port || '3128', 10),
      },
      () => {
        const connectReq = [
          `CONNECT ${targetHost}:${targetPort} HTTP/1.1`,
          `Host: ${targetHost}:${targetPort}`,
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
          const tlsOptions: tls.ConnectionOptions = {
            socket: proxySocket,
            servername: targetHost,
            rejectUnauthorized: false,
          };

          if (clientCert && clientKey) {
            tlsOptions.cert = clientCert;
            tlsOptions.key = clientKey;
          }

          const tlsSocket = tls.connect(tlsOptions, () => {
            const headers = [
              `${method} ${apiUrl.pathname}${apiUrl.search} HTTP/1.1`,
              `Host: ${targetHost}`,
              'Accept: application/json',
              'Accept-Encoding: identity',
            ];

            if (token) {
              headers.push(`Authorization: Bearer ${token}`);
            }

            if (body !== undefined && body !== null) {
              const bodyStr = JSON.stringify(body);
              const contentType =
                method === 'PATCH' ? 'application/json-patch+json' : 'application/json';
              headers.push(`Content-Type: ${contentType}`);
              headers.push(`Content-Length: ${Buffer.byteLength(bodyStr)}`);
              headers.push('Connection: close', '', bodyStr);
            } else {
              headers.push('Connection: close', '', '');
            }

            tlsSocket.write(headers.join('\r\n'));
          });

          let httpResponse = '';
          tlsSocket.on('data', (tlsChunk) => {
            httpResponse += tlsChunk.toString();
          });

          tlsSocket.on('end', () => {
            const sep = httpResponse.indexOf('\r\n\r\n');
            if (sep === -1) {
              reject(new Error('Incomplete HTTP response'));
              return;
            }
            const headerSection = httpResponse.slice(0, sep);
            const rawBody = httpResponse.slice(sep + 4);
            const [httpStatusLine] = headerSection.split('\r\n');
            const httpStatus = parseInt(httpStatusLine.split(' ')[1], 10);

            if (httpStatus >= 200 && httpStatus < 300) {
              try {
                const bodyText = normalizeProxyResponseBody(headerSection, rawBody);
                resolve(
                  bodyText
                    ? (JSON.parse(bodyText) as KubernetesResource)
                    : ({} as KubernetesResource),
                );
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                reject(
                  new Error(
                    `Failed to parse Kubernetes API JSON response: ${msg}. ` +
                      `Status ${httpStatus}.`,
                  ),
                );
              }
            } else if (httpStatus === 404) {
              resolve(null);
            } else {
              reject(new Error(`HTTP ${httpStatus}: ${httpStatusLine}`));
            }
          });

          tlsSocket.on('error', (err) => {
            reject(new Error(`TLS error: ${err.message}`));
          });
        } else {
          proxySocket.destroy();
          reject(new Error(`Proxy CONNECT failed with status ${statusCode}: ${statusLine}`));
        }
      }
    };

    proxySocket.on('data', onData);

    proxySocket.on('error', (err) => {
      reject(new Error(`Proxy connection failed: ${err.message}`));
    });

    proxySocket.setTimeout(60000, () => {
      proxySocket.destroy();
      reject(new Error('Connection timeout after 60s'));
    });
  });
}

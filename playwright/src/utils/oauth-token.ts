/**
 * Obtain an OAuth bearer token from the OpenShift OAuth server via HTTP.
 * Replaces the `oc login` + `oc whoami --show-token` pattern.
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

const AGENT = new https.Agent({ rejectUnauthorized: false });

async function httpRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    followRedirects?: boolean;
    maxRedirects?: number;
  } = {},
): Promise<{
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}> {
  const { method = 'GET', headers = {}, followRedirects = false, maxRedirects = 10 } = options;
  let currentUrl = url;
  let redirectCount = 0;

  while (true) {
    const parsed = new URL(currentUrl);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const result = await new Promise<{
      statusCode: number;
      headers: Record<string, string | string[] | undefined>;
      body: string;
    }>((resolve, reject) => {
      const req = lib.request(
        currentUrl,
        {
          method,
          headers,
          agent: isHttps ? AGENT : undefined,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk: Buffer) => (body += chunk.toString()));
          res.on('end', () =>
            resolve({
              statusCode: res.statusCode ?? 0,
              headers: res.headers as Record<string, string | string[] | undefined>,
              body,
            }),
          );
        },
      );
      req.on('error', reject);
      req.end();
    });

    if (
      followRedirects &&
      result.statusCode >= 300 &&
      result.statusCode < 400 &&
      result.headers.location
    ) {
      redirectCount++;
      if (redirectCount > maxRedirects) {
        throw new Error(`Too many redirects (${maxRedirects})`);
      }
      const location = Array.isArray(result.headers.location)
        ? result.headers.location[0]
        : result.headers.location;
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    return result;
  }
}

/**
 * Obtain an OAuth bearer token for the given user credentials.
 *
 * Uses the OpenShift OAuth server's `authorize` endpoint with the
 * `openshift-challenging-client` to get a token via HTTP basic auth,
 * mimicking what `oc login` does under the hood.
 */
export async function fetchOAuthToken(
  clusterUrl: string,
  username: string,
  password: string,
): Promise<string> {
  const base = clusterUrl.replace(/\/+$/, '');

  const wellKnownUrl = `${base}/.well-known/oauth-authorization-server`;
  let authorizationEndpoint: string;

  try {
    const resp = await httpRequest(wellKnownUrl);
    if (resp.statusCode === 200) {
      const meta = JSON.parse(resp.body) as { authorization_endpoint?: string };
      authorizationEndpoint = meta.authorization_endpoint ?? `${base}/oauth/authorize`;
    } else {
      authorizationEndpoint = `${base}/oauth/authorize`;
    }
  } catch {
    authorizationEndpoint = `${base}/oauth/authorize`;
  }

  const authorizeUrl =
    `${authorizationEndpoint}?client_id=openshift-challenging-client` + `&response_type=token`;

  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  const resp = await httpRequest(authorizeUrl, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'X-CSRF-Token': '1',
    },
    followRedirects: false,
  });

  if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
    const location = Array.isArray(resp.headers.location)
      ? resp.headers.location[0]
      : resp.headers.location;
    const match = location.match(/access_token=([^&]+)/);
    if (match) return match[1];
    throw new Error(`No access_token in redirect: ${location}`);
  }

  throw new Error(
    `OAuth authorize returned ${resp.statusCode} instead of a redirect. Body: ${resp.body.substring(0, 200)}`,
  );
}

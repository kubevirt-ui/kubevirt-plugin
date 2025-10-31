import { TFunction } from 'react-i18next';

import {
  ConfigMapModel,
  JobModel,
  RouteModel,
  ServiceModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1Service,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sDelete, k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { addOwnerReference } from './selfValidationJob';

// ===========================
// Constants
// ===========================

const NGINX_RESOURCE_NAMES = {
  ACTIVE_DEADLINE_SECONDS: 3600, // 1 hour
  CONFIG_MAP_PREFIX: 'nginx-conf',
  DELETION_DELAY_MS: 2000,
  POD_PREFIX: 'pvc-reader',
  ttlSecondsAfterFinished: 3600, // 1 hour
} as const;

// ===========================
// Types
// ===========================

interface NginxJobResource {
  apiVersion: string;
  kind: string;
  metadata: {
    labels: { app: string };
    name: string;
    namespace: string;
    uid?: string;
  };
  spec: {
    activeDeadlineSeconds: number;
    backoffLimit: number;
    template: {
      metadata: {
        labels: { app: string };
      };
      spec: {
        containers: {
          command: string[];
          image: string;
          name: string;
          ports: { containerPort: number; name: string }[];
          resources: Record<string, any>;
          securityContext: {
            allowPrivilegeEscalation: boolean;
            capabilities: { drop: string[] };
            runAsNonRoot: boolean;
            seccompProfile: { type: string };
          };
          volumeMounts: {
            mountPath: string;
            name: string;
            readOnly?: boolean;
            subPath?: string;
          }[];
        }[];
        dnsPolicy: string;
        restartPolicy: string;
        volumes: (
          | {
              configMap: { items: { key: string; path: string }[]; name: string };
              name: string;
            }
          | {
              name: string;
              persistentVolumeClaim: { claimName: string };
            }
        )[];
      };
    };
    ttlSecondsAfterFinished: number;
  };
}

// ===========================
// Resource Templates
// ===========================

const nginxConfigMap = (
  namespace: string,
  configMapName: string,
  podName?: string,
  podUid?: string,
): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: 'v1',
  data: {
    'nginx.conf': `user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    server {
        listen 8080;

        # Add CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;

        location / {
            alias /results/;
            autoindex on;
            autoindex_exact_size off;
            autoindex_localtime on;
            location ~ /\\.\\./ {
                deny all;
            }
            
            # If directory is empty, show a helpful message
            try_files $uri $uri/ @empty;
        }
        
        location @empty {
            return 200 '<html><head><title>Self-Validation Results</title></head><body><h1>Self-Validation Results</h1><p>The results directory is empty or no files were found.</p><p>This could mean:</p><ul><li>The checkup is still running</li><li>The checkup completed but no results were generated</li><li>There was an issue with result generation</li></ul><p>Please check the checkup status and try again later.</p></body></html>';
            add_header Content-Type text/html;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }
    }
}`,
  },
  kind: 'ConfigMap',
  metadata: {
    name: configMapName,
    namespace,
    ...(podUid &&
      podName && {
        ownerReferences: [
          {
            apiVersion: 'v1',
            blockOwnerDeletion: true,
            kind: 'Pod',
            name: podName,
            uid: podUid,
          },
        ],
      }),
  },
});

const nginxJob = (
  pvcName: string,
  namespace: string,
  jobName: string,
  configMapName: string,
): NginxJobResource => ({
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {
    labels: { app: jobName },
    name: jobName,
    namespace,
  },
  spec: {
    activeDeadlineSeconds: NGINX_RESOURCE_NAMES.ACTIVE_DEADLINE_SECONDS,
    backoffLimit: 0,
    template: {
      metadata: {
        labels: { app: jobName },
      },
      spec: {
        containers: [
          {
            command: ['sh', '-c', 'nginx -g "daemon off;"'],
            image: 'registry.redhat.io/rhel9/nginx-124:latest',
            name: 'pod',
            ports: [{ containerPort: 8080, name: 'nginx' }],
            resources: {},
            securityContext: {
              allowPrivilegeEscalation: false,
              capabilities: { drop: ['ALL'] },
              runAsNonRoot: true,
              seccompProfile: {
                type: 'RuntimeDefault',
              },
            },
            volumeMounts: [
              { mountPath: '/results', name: 'results', readOnly: false },
              {
                mountPath: '/etc/nginx/nginx.conf',
                name: 'conf',
                subPath: 'nginx.conf',
              },
            ],
          },
        ],
        dnsPolicy: 'ClusterFirst',
        restartPolicy: 'Never',
        volumes: [
          { name: 'results', persistentVolumeClaim: { claimName: pvcName } },
          {
            configMap: {
              items: [{ key: 'nginx.conf', path: 'nginx.conf' }],
              name: configMapName,
            },
            name: 'conf',
          },
        ],
      },
    },
    ttlSecondsAfterFinished: NGINX_RESOURCE_NAMES.ttlSecondsAfterFinished,
  },
});

const nginxService = (
  namespace: string,
  serviceName: string,
  jobName: string,
  jobUid?: string,
): IoK8sApiCoreV1Service => ({
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    labels: { app: jobName },
    name: serviceName,
    namespace,
    ...(jobUid && {
      ownerReferences: [
        {
          apiVersion: 'batch/v1',
          blockOwnerDeletion: true,
          kind: 'Job',
          name: jobName,
          uid: jobUid,
        },
      ],
    }),
  },
  spec: {
    ports: [{ name: 'nginx', port: 8080, protocol: 'TCP', targetPort: 'nginx' }],
    selector: { app: jobName },
    type: 'ClusterIP',
  },
});

const nginxRoute = (
  namespace: string,
  routeName: string,
  serviceName: string,
  jobName: string,
  jobUid?: string,
): any => ({
  apiVersion: 'route.openshift.io/v1',
  kind: 'Route',
  metadata: {
    name: routeName,
    namespace,
    ...(jobUid && {
      ownerReferences: [
        {
          apiVersion: 'batch/v1',
          blockOwnerDeletion: true,
          kind: 'Job',
          name: jobName,
          uid: jobUid,
        },
      ],
    }),
  },
  spec: {
    path: '/',
    port: { targetPort: 'nginx' },
    tls: { insecureEdgeTerminationPolicy: 'Redirect', termination: 'edge' },
    to: { kind: 'Service', name: serviceName, weight: 100 },
    wildcardPolicy: 'None',
  },
});

// ===========================
// Nginx Server Management
// ===========================

/**
 * Creates an nginx server to view detailed results from a PVC
 * Sets up: nginx Job (with auto-cleanup), ConfigMap, Service, and Route
 * Uses owner references to ensure all resources are cleaned up together
 * @param checkupName - Name of the checkup job (used to find PVC)
 * @param namespace - Kubernetes namespace
 * @returns The created Route resource, or null if creation fails
 */
export const createDetailedResultsViewer = async (
  checkupName: string,
  namespace: string,
): Promise<any> => {
  const nameParts = checkupName.split('-');
  const lastThreeSegments = nameParts.slice(-3).join('-');
  const routeName = lastThreeSegments;
  const serviceName = lastThreeSegments;
  const jobName = `${NGINX_RESOURCE_NAMES.POD_PREFIX}-${lastThreeSegments}`;
  const configMapName = `${NGINX_RESOURCE_NAMES.CONFIG_MAP_PREFIX}-${lastThreeSegments}`;

  try {
    const existingRoute = await k8sGet({
      model: RouteModel,
      name: routeName,
      ns: namespace,
    });

    if (existingRoute) {
      kubevirtConsole.log("Detailed results viewer already exists, checking if it's working...");
      const url = `https://${(existingRoute as any).spec?.host}`;

      try {
        await fetch(url, {
          cache: 'no-cache',
          method: 'GET',
          mode: 'no-cors',
        });
        return existingRoute;
      } catch (error) {
        kubevirtConsole.warn('Existing server is not responding, will recreate resources', error);
      }
    }
  } catch (error) {
    kubevirtConsole.warn('No existing detailed results viewer found, creating new one', error);
  }

  try {
    await k8sDelete({
      model: ConfigMapModel,
      resource: { metadata: { name: configMapName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn('No existing pod found, will create new one', error);
  }

  try {
    await k8sDelete({
      model: JobModel,
      resource: { metadata: { name: jobName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn('No existing job found, will create new one', error);
  }

  try {
    await k8sDelete({
      model: ServiceModel,
      resource: { metadata: { name: serviceName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn('No existing route found, will create new one', error);
  }

  try {
    await k8sDelete({
      model: RouteModel,
      resource: { metadata: { name: routeName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn('No existing route found, will create new one', error);
  }

  // Small delay to ensure resources are fully deleted
  await new Promise((resolve) => setTimeout(resolve, NGINX_RESOURCE_NAMES.DELETION_DELAY_MS));

  // Step 1: Create ConfigMap first (without owner reference) - Pod needs this to start
  try {
    await k8sCreate({
      data: nginxConfigMap(namespace, configMapName),
      model: ConfigMapModel,
    });
  } catch (error) {
    kubevirtConsole.warn('Failed to create nginx config map', error);
    return null;
  }

  // Step 2: Create Job and capture its UID
  let jobUid: string | undefined;
  try {
    const createdJob = await k8sCreate({
      data: nginxJob(checkupName, namespace, jobName, configMapName),
      model: JobModel,
    });
    jobUid = createdJob.metadata?.uid;
  } catch (error) {
    kubevirtConsole.warn('Failed to create nginx job', error);
    return null;
  }

  // Step 3: Update ConfigMap with owner reference to Job (so it gets cleaned up with Job)
  if (jobUid) {
    await addOwnerReference(ConfigMapModel, configMapName, namespace, {
      apiVersion: 'batch/v1',
      kind: 'Job',
      name: jobName,
      uid: jobUid,
    });
  }

  // Step 4: Create Service with owner reference to Job
  try {
    await k8sCreate({
      data: nginxService(namespace, serviceName, jobName, jobUid),
      model: ServiceModel,
    });
  } catch (error) {
    kubevirtConsole.warn('Failed to create nginx service', error);
  }

  // Step 5: Create Route with owner reference to Job
  try {
    const route = await k8sCreate({
      data: nginxRoute(namespace, routeName, serviceName, jobName, jobUid),
      model: RouteModel,
    });
    return route;
  } catch (error) {
    kubevirtConsole.warn('Failed to create nginx route', error);
  }

  return null;
};

/**
 * Waits for nginx server to be ready by polling the health endpoint
 * Uses no-cors mode for CORS compatibility and retries until server responds
 * @param url - The URL to check
 * @param t - Translation function
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 60000)
 * @returns Promise with success status and optional error message
 */
export const waitForNginxServer = async (
  url: string,
  t: TFunction,
  timeoutMs: number = 60000,
): Promise<{ error?: string; success: boolean }> => {
  const startTime = Date.now();
  const checkInterval = 5000;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const healthUrl = `${url}/health`;
      await fetch(healthUrl, {
        cache: 'no-cache',
        method: 'GET',
        mode: 'no-cors',
      });

      // With no-cors mode, we can't check response.ok, but if the fetch succeeds, the server is responding
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return { success: true };
    } catch (error) {
      kubevirtConsole.error('Health check failed:', error);

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          error: t(
            'Unable to access the detailed results server. This may be due to CORS restrictions or network connectivity issues.',
          ),
          success: false,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }
  }

  return {
    error: t(
      'The detailed results server failed to start within the timeout period. Please try again later.',
    ),
    success: false,
  };
};

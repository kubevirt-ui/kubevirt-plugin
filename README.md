# OpenShift Console Kubevirt Plugin

[![DeepSource](https://deepsource.io/gh/kubevirt-ui/kubevirt-plugin.svg/?label=active+issues&show_trend=true&token=EL0lOflk4suZx1hYxP2bbqPP)](https://deepsource.io/gh/kubevirt-ui/kubevirt-plugin/?ref=repository-badge)
[![codecov](https://codecov.io/gh/kubevirt-ui/kubevirt-plugin/branch/main/graph/badge.svg?token=W9I1PI7C4O)](https://codecov.io/gh/kubevirt-ui/kubevirt-plugin)

![alt kubevirt ui logos](https://raw.githubusercontent.com/kubevirt-ui/kubevirt-plugin/main/images/logos.png)

This project is a standalone repository hosting the Kubevirt plugin
for OpenShift Console.

## Local development

### Option 1 (recommended): Docker + VSCode Remote Container

Make sure the [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension is installed. This method uses Docker Compose where one container is
the OpenShift console and the second container is the plugin. It requires that
you have access to an existing OpenShift cluster. After the initial build, the
cached containers will help you start developing in seconds.

1. Create a `dev.env` file inside the `.devcontainer` folder with the correct values for your cluster:

```bash
OC_PLUGIN_NAME=kubevirt-plugin
OC_URL=https://api.example.com:6443
OC_USER=kubeadmin
OC_PASS=<password>
```

2. `(Ctrl+Shift+P) => Remote Containers: Open Folder in Container...`
3. `yarn dev`
4. Navigate to <http://localhost:9000>

#### Cypress Testing inside the container

1. `yarn test-cypress-docker`
2. Navigate to <http://localhost:10000>
3. login with password `kubevirt` (no need for username)

### Option 2:

1. Set up [Console](https://github.com/openshift/console) and See the plugin development section in [Console Dynamic Plugins README](https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/README.md) for details on how to run OpenShift console using local plugins.
2. Run bridge with `-plugins kubevirt-plugin=http://localhost:9001`
3. Run `yarn dev` inside the plugin.

---

## i18n

The plugin uses the following
`plugin__kubevirt-plugin` namespace. You should use the `useTranslation` hook
with this namespace as follows:

```tsx
conster Header: React.FC = () => {
  const { t } = useTranslation('plugin__kubevirt-plugin');
  return <h1>{t('Hello, World!')}</h1>;
};
```

For labels in `console-extensions.json`, you should use the format
`%plugin__kubevirt-plugin~My Label%`. Console will replace the value with
the message for the current language from the `plugin__kubevirt-plugin`
namespace. For example:

```json
{
  "type": "console.navigation/section",
  "properties": {
    "id": "admin-demo-section",
    "perspective": "admin",
    "name": "%plugin__kubevirt-plugin~VirtualMachines%"
  }
}
```

Note that you will need to include a comment in `utils/i18n.ts` like the
following for [i18next-parser](https://github.com/i18next/i18next-parser) to
add the message from `console-extensions.json` to your message catalog as follows:

```ts
// t('plugin__kubevirt-plugin~VirtualMachines')
```

Run `yarn i18n` to update the JSON files in the `locales` folder of the
dynamic plugin when adding or changing messages.

## Docker image

1. Build the image:
   ```sh
   docker build -t quay.io/kubevirt-ui/kubevirt-plugin:latest .
   ```
2. Run the image:
   ```sh
   docker run -it --rm -d -p 9001:80 quay.io/kubevirt-ui/kubevirt-plugin:latest
   ```
3. Push the image to the image registry:
   ```sh
   docker push quay.io/kubevirt-ui/kubevirt-plugin:latest
   ```

## Deployment on cluster

After pushing an image with your changes to an image registry, you can deploy
the plugin to a cluster by instantiating the template:

```sh
oc process -f template.yaml \
  -p PLUGIN_NAME=kubevirt-plugin \
  -p NAMESPACE=kubevirt-ui \
  -p IMAGE=quay.io/kubevirt-ui/kubevirt-plugin:latest \
  | oc create -f -
```

Once deployed, patch the
[Console operator](https://github.com/openshift/console-operator)
config to enable the plugin.

```sh
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["kubevirt-plugin"] } }' --type=merge
```

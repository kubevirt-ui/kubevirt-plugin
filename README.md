# OpenShift Console Kubevirt Plugin

This project is a standalone repository hosting the Kubevirt plugin
for OpenShift Console.

## Local development

1. `yarn dev` to serve the plugin with webpack dev server, generating output to `dist` directory
2. run bridge with `-plugins kubevirt-plugin=http://localhost:9001`

## i18n

The plugin uses the
`plugin__kubevirt-plugin` namespace. You can use the `useTranslation` hook
with this namespace as follows:

```tsx
conster Header: React.FC = () => {
  const { t } = useTranslation('plugin__kubevirt-plugin');
  return <h1>{t('Hello, World!')}</h1>;
};
```

For labels in `console-extensions.json`, you can use the format
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

Note that you will need to include a comment in a TypeScript file like the
following for [i18next-parser](https://github.com/i18next/i18next-parser) to
add the message from `console-extensions.json` to your message catalog.

```ts
// t('plugin__kubevirt-plugin~VirtualMachines')
```

Running `yarn i18n` updates the JSON files in the `locales` folder of the
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
  -p NAMESPACE=kubevirt-plugin \
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

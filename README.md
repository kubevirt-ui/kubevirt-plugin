# OpenShift Console Kubevirt Plugin

This project is a standalone repository hosting the Kubevirt plugin
for OpenShift Console.

## Local development

1. `yarn dev` to serve the plugin with webpack dev server, generating output to `dist` directory
2.  run bridge with `-plugins kubevirt-plugin=http://localhost:9001`


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
      "name": "%plugin__kubevirt-plugin~Virtual Machines%"
    }
  }
```

Note that you will need to include a comment in a TypeScript file like the
following for [i18next-parser](https://github.com/i18next/i18next-parser) to
add the message from `console-extensions.json` to your message catalog.

```ts
// t('plugin__kubevirt-plugin~Virtual Machines')
```

Running `yarn i18n` updates the JSON files in the `locales` folder of the
dynamic plugin when adding or changing messages.

type CreateServiceBindingModalProps = CreateServiceBindingFormProps & {
  model: K8sKind;
  source: K8sResourceKind;
  target?: K8sResourceKind;
  close?: () => void;
};

type CreateServiceBindingFormType = {
  name: string;
  bindableService: K8sResourceKind;
};

const handleRedirect = async (
  project: string,
  perspective: string,
  perspectiveExtensions: Perspective[],
) => {
  const perspectiveData = perspectiveExtensions.find((item) => item.properties.id === perspective);
  const redirectURL = (await perspectiveData.properties.importRedirectURL())(project);
  history.push(redirectURL);
};

const CreateServiceBindingModal: React.FC<CreateServiceBindingModalProps> = (props) => {
  const { source, model } = props;
  const { t } = useTranslation();
  const fireTelemetryEvent = useTelemetry();
  const [activePerspective] = useValuesForPerspectiveContext();
  const perspectiveExtensions = usePerspectives();
  const handleSubmit = async (values, actions) => {
    const bindings: K8sResourceKind[] = await k8sList(ServiceBindingModel, {
      ns: source.metadata.namespace,
    });
    let existingServiceBinding = {};
    if (bindings.length > 0) {
      existingServiceBinding = checkExistingServiceBinding(
        bindings,
        source,
        values.bindableService,
        model,
      );
    }
    if (Object.keys(existingServiceBinding ?? {}).length === 0) {
      try {
        await createServiceBinding(source, values.bindableService, values.name);
        props.close();
        fireTelemetryEvent('Service Binding Created');
        getQueryArgument('view') === null &&
          handleRedirect(source.metadata.namespace, activePerspective, perspectiveExtensions);
      } catch (errorMessage) {
        actions.setStatus({ submitError: errorMessage.message });
      }
    } else {
      actions.setStatus({
        submitError: t(
          'console-app~Service binding already exists. Select a different service to connect to.',
        ),
      });
    }
  };

  const initialValues: CreateServiceBindingFormType = {
    name: props.target
      ? `${source.metadata.name}-${model.abbr.toLowerCase()}-${
          props.target.metadata.name
        }-${modelFor(referenceFor(props.target)).abbr.toLowerCase()}`
      : '',
    bindableService: props.target ? props.target : {},
  };
  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: '' }}
      validationSchema={serviceBindingValidationSchema(t)}
      onSubmit={handleSubmit}
    >
      {(formikProps) => <CreateServiceBindingForm {...formikProps} {...props} />}
    </Formik>
  );
};

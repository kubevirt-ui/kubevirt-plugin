import * as React from 'react';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { COMPONENT_NOT_FOUND_ERROR } from './constants';

const URLHealthItemPopup: React.FC<any> = ({ subsystem }) => {
  const [PopupComponent, setPopupComponent] = React.useState(null);

  React.useEffect(() => {
    const loadComponent = () => {
      // TODO Fix typing
      // skipcq: JS-0349
      (subsystem as any)?.popupComponent
        ?.loader()
        .then((Component) => {
          if (!Component) {
            return Promise.reject(COMPONENT_NOT_FOUND_ERROR);
          }
          setPopupComponent(Component);
        })
        .catch((error) => {
          if (error === COMPONENT_NOT_FOUND_ERROR) {
            kubevirtConsole.error(COMPONENT_NOT_FOUND_ERROR);
          } else {
            setTimeout(() => loadComponent(), 1000);
          }
        });
    };

    if (subsystem?.popupComponent) {
      loadComponent();
    }
  }, [subsystem, setPopupComponent]);

  return PopupComponent || null;
};

export default URLHealthItemPopup;

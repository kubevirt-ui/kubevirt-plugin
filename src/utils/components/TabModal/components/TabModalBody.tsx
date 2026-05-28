import React, { FC, FormEvent, ReactNode } from 'react';

import { Form, ModalBody } from '@patternfly/react-core';

type TabModalBodyProps = {
  children: ReactNode;
  formClassName?: string;
  isHorizontal?: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  shouldWrapInForm?: boolean;
};

const TabModalBody: FC<TabModalBodyProps> = ({
  children,
  formClassName,
  isHorizontal,
  onSubmit,
  shouldWrapInForm,
}) => (
  <ModalBody>
    {shouldWrapInForm ? (
      <Form
        className={formClassName}
        form="tab-modal-form"
        id="tab-modal-form"
        isHorizontal={isHorizontal}
        onSubmit={onSubmit}
      >
        {children}
      </Form>
    ) : (
      <>{children}</>
    )}
  </ModalBody>
);

export default TabModalBody;

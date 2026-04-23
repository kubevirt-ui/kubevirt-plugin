import React, { FC, ReactNode } from 'react';

const ErrorHelperText: FC<{ children?: ReactNode }> = ({ children }) => {
  return <div className="pf-v6-c-form__helper-text pf-m-error">{children}</div>;
};
export default ErrorHelperText;

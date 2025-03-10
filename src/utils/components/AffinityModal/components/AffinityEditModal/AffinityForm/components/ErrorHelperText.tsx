import * as React from 'react';

const ErrorHelperText: React.FC = ({ children }) => {
  return <div className="pf-v6-c-form__helper-text pf-m-error">{children}</div>;
};
export default ErrorHelperText;

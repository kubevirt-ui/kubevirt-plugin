import * as React from 'react';

type PageHeaderProps = {
  badge?: React.ReactNode;
  title?: string | JSX.Element;
  children?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = (props) => {
  const { badge, title, children } = props;
  return (
    <div className="co-m-nav-title">
      <h1 className="co-m-pane__heading">
        <div className="co-m-pane__name co-resource-item">
          <span data-test-id="resource-title" className="co-resource-item__resource-name">
            {title}
          </span>
        </div>
        <span>
          {children}
          <span className="co-m-pane__heading-badge">{badge}</span>
        </span>
      </h1>
    </div>
  );
};

export default PageHeader;

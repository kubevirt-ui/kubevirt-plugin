import React, { FC, useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Nav, NavItem, NavList } from '@patternfly/react-core';

import { NavPageKubevirt, trimLastHistoryPath } from './utils/utils';

import './horizontal-nav-bar.scss';

type HorizontalNavbarProps = {
  pages: NavPageKubevirt[];
  resource?: K8sResourceCommon;
};

const HorizontalNavbar: FC<HorizontalNavbarProps> = ({ pages, resource }) => {
  const [activeItem, setActiveItem] = useState<number | string>(pages?.[0]?.name.toLowerCase());
  const history = useHistory();
  const paths = pages.map((page) => page.href);

  const onSelect = (result: { itemId: number | string; to: string }) => {
    const [active] = (result.itemId as string).split('/');
    setActiveItem(active);
    history.push(trimLastHistoryPath(history, paths) + '/' + result.to);
  };

  useEffect(() => {
    const pathName = history.location.pathname;
    for (const path of paths) {
      if (pathName.endsWith(path) && path !== '') {
        const isKnown = pathName.includes(path.toLowerCase());
        const [active] = path.split('/');
        setActiveItem(isKnown ? active : pages?.[0]?.name.toLowerCase());
      }
    }
  }, [pages, history.location.pathname, paths]);

  return (
    <>
      <Nav onSelect={onSelect} variant="horizontal">
        <NavList className="co-m-horizontal-nav__menu horizontal-nav-bar__list">
          {pages.map((item) => {
            if (item?.isHidden) return null;

            return (
              <NavItem
                className="horizontal-nav-bar__menu-item"
                data-test-id={`horizontal-link-${item.name}`}
                id={`horizontal-pageHeader-${item.name}`}
                isActive={activeItem === item.name.toLowerCase()}
                itemId={item.name.toLowerCase()}
                key={item.name}
                preventDefault
                to={item.href}
              >
                {item.name}
              </NavItem>
            );
          })}
        </NavList>
      </Nav>
      <Switch>
        {pages.map((page) => {
          const Component = page.component;
          return (
            <Route
              component={(props) => <Component {...props} obj={resource} />}
              exact
              key={page.href}
              path={trimLastHistoryPath(history, paths) + '/' + page.href}
            />
          );
        })}
      </Switch>
    </>
  );
};

export default HorizontalNavbar;

import React, { FC, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Nav, NavList } from '@patternfly/react-core';

import { NavPageKubevirt, trimLastHistoryPath } from './utils/utils';

import './horizontal-nav-bar.scss';

type HorizontalNavbarProps = {
  instanceTypeExpandedSpec?: V1VirtualMachine;
  pages: NavPageKubevirt[];
  vm?: V1VirtualMachine;
};

const HorizontalNavbar: FC<HorizontalNavbarProps> = ({ instanceTypeExpandedSpec, pages, vm }) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState<number | string>(
    location?.pathname.endsWith('/') ? null : pages?.[0]?.name.toLowerCase(),
  );
  const paths = pages.map((page) => page.href);

  return (
    <>
      <Nav variant="horizontal">
        <NavList className="co-m-horizontal-nav__menu horizontal-nav-bar__list">
          {pages.map((item) => {
            if (item?.isHidden) return null;

            return (
              <NavLink
                className={classNames('horizontal-nav-bar__menu-item', {
                  active: activeItem === item.name.toLowerCase(),
                })}
                data-test-id={`horizontal-link-${item.name}`}
                id={`horizontal-pageHeader-${item.name}`}
                key={item.name}
                onClick={() => setActiveItem(item.name.toLowerCase())}
                to={trimLastHistoryPath(location, paths) + '/' + item.href}
              >
                {item.name}
              </NavLink>
            );
          })}
        </NavList>
      </Nav>
      <Routes>
        {pages.map((page) => {
          const Component = page.component;
          return (
            <Route
              Component={(props) => (
                <Component instanceTypeExpandedSpec={instanceTypeExpandedSpec} vm={vm} {...props} />
              )}
              key={page.href}
              path={page.href}
            />
          );
        })}
      </Routes>
    </>
  );
};

export default HorizontalNavbar;

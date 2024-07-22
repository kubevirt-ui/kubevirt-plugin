import React, { FC, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom-v5-compat';
import classNames from 'classnames';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Nav, NavList } from '@patternfly/react-core';

import useDynamicPages from './utils/useDynamicPages';
import { NavPageKubevirt, trimLastHistoryPath } from './utils/utils';

import './horizontal-nav-bar.scss';

type HorizontalNavbarProps = {
  instanceTypeExpandedSpec?: V1VirtualMachine;
  pages: NavPageKubevirt[];
  vm?: V1VirtualMachine;
};

const HorizontalNavbar: FC<HorizontalNavbarProps> = ({ instanceTypeExpandedSpec, pages, vm }) => {
  const location = useLocation();

  const params = useParams();

  const dynamicPluginPages = useDynamicPages(VirtualMachineModel);

  const allPages = useMemo(
    () => [...pages, ...(dynamicPluginPages || [])] as NavPageKubevirt[],
    [pages, dynamicPluginPages],
  );

  const paths = allPages.map((page) => page.href);

  useEffect(() => {
    const defaultPage = allPages.find(({ href }) => isEmpty(href));

    const initialActiveTab =
      allPages.find(({ href }) => !isEmpty(href) && location?.pathname.includes('/' + href)) ||
      defaultPage;

    setActiveItem(initialActiveTab?.name?.toLowerCase());
  }, [allPages, location?.pathname]);

  const [activeItem, setActiveItem] = useState<number | string>();
  return (
    <>
      <Nav variant="horizontal">
        <NavList className="co-m-horizontal-nav__menu horizontal-nav-bar__list">
          {allPages.map((item) => {
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
                to={trimLastHistoryPath(location, paths) + item.href}
              >
                {item.name}
              </NavLink>
            );
          })}
        </NavList>
      </Nav>
      <Routes>
        {allPages.map((page) => {
          const Component = page.component;
          return (
            <Route
              Component={(props) => (
                <Component
                  instanceTypeExpandedSpec={instanceTypeExpandedSpec}
                  obj={vm}
                  params={params}
                  {...props}
                />
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

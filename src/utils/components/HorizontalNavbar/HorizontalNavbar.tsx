import React, { FC, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom-v5-compat';
import classNames from 'classnames';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Nav, NavList } from '@patternfly/react-core';

import StateHandler from '../StateHandler/StateHandler';

import useDynamicPages from './utils/useDynamicPages';
import { NavPageKubevirt, trimLastHistoryPath } from './utils/utils';

import './horizontal-nav-bar.scss';

type HorizontalNavbarProps = {
  error?: any;
  instanceTypeExpandedSpec?: V1VirtualMachine;
  loaded: boolean;
  pages: NavPageKubevirt[];
  vm?: V1VirtualMachine;
};

const HorizontalNavbar: FC<HorizontalNavbarProps> = ({
  error,
  instanceTypeExpandedSpec,
  loaded,
  pages,
  vm,
}) => {
  const location = useLocation();

  const params = useParams();
  const [memoParams, setMemoParams] = useState(params);

  useEffect(() => {
    setMemoParams((preParams) =>
      JSON.stringify(params) !== JSON.stringify(preParams) ? params : preParams,
    );
  }, [params]);

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

  const RoutesComponents = useMemo(() => {
    return allPages.map((page) => {
      const Component = page.component;
      return (
        <Route
          Component={(props) => (
            <StateHandler error={error} loaded={loaded} withBullseye>
              <Component
                instanceTypeExpandedSpec={instanceTypeExpandedSpec}
                obj={vm}
                params={memoParams}
                {...props}
              />
            </StateHandler>
          )}
          key={page.href}
          path={page.href}
        />
      );
    });
  }, [allPages, vm, error, loaded, instanceTypeExpandedSpec, memoParams]);

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
      <Routes>{RoutesComponents}</Routes>
    </>
  );
};

export default HorizontalNavbar;

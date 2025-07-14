import React, { FC, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom-v5-compat';
import classNames from 'classnames';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import StateHandler from '../StateHandler/StateHandler';

import useDynamicPages from './utils/useDynamicPages';
import { NavPageKubevirt, trimLastHistoryPath } from './utils/utils';

type HorizontalNavbarProps = {
  basePath?: string;
  error?: any;
  instanceTypeExpandedSpec?: V1VirtualMachine;
  loaded: boolean;
  pages: NavPageKubevirt[];
  vm?: V1VirtualMachine;
};

const HorizontalNavbar: FC<HorizontalNavbarProps> = ({
  basePath = '',
  error,
  instanceTypeExpandedSpec,
  loaded,
  pages,
  vm,
}) => {
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
      allPages.find(
        ({ href }) =>
          !isEmpty(href) && location?.pathname?.replace(basePath, '').includes('/' + href),
      ) || defaultPage;

    setActiveItem(initialActiveTab?.name?.toLowerCase());
  }, [allPages, location?.pathname]);

  const [activeItem, setActiveItem] = useState<number | string>();

  const RoutesComponents = allPages.map((page) => {
    const Component = page.component;
    return (
      <Route
        element={
          <StateHandler error={error} hasData={!!vm} loaded={loaded} withBullseye>
            <Component
              instanceTypeExpandedSpec={instanceTypeExpandedSpec}
              obj={vm}
              params={params}
            />
          </StateHandler>
        }
        key={page.href}
        path={page.href}
      />
    );
  });

  return (
    <>
      <nav className="pf-v6-c-tabs pf-m-page-insets">
        <ul className="pf-v6-c-tabs__list">
          {allPages.map((item) => {
            if (item?.isHidden) return null;

            return (
              <li
                className={classNames('pf-v6-c-tabs__item', {
                  'pf-m-current': activeItem === item.name.toLowerCase(),
                })}
                key={item.name}
              >
                <NavLink
                  to={
                    basePath +
                    trimLastHistoryPath(location.pathname.replace(basePath, ''), paths) +
                    item.href
                  }
                  className="pf-v6-c-tabs__link"
                  data-test-id={`horizontal-link-${item.name}`}
                  id={`horizontal-pageHeader-${item.name}`}
                  onClick={() => setActiveItem(item.name.toLowerCase())}
                >
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <Routes>{RoutesComponents}</Routes>
    </>
  );
};

export default HorizontalNavbar;

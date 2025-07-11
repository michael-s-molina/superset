/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { getExtensionsRegistry, VizType } from '@superset-ui/core';
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { isEmbedded } from 'src/dashboard/util/isEmbedded';
import { useUiConfig } from 'src/components/UiConfigContext';
import SliceHeader from '.';

jest.mock('src/dashboard/components/SliceHeaderControls', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-test="SliceHeaderControls"
      data-slice={JSON.stringify(props.slice)}
      data-is-cached={props.isCached}
      data-is-expanded={props.isExpanded}
      data-cached-dttm={props.cachedDttm}
      data-updated-dttm={props.updatedDttm}
      data-superset-can-explore={props.supersetCanExplore}
      data-superset-can-csv={props.supersetCanCSV}
      data-component-id={props.componentId}
      data-dashboard-id={props.dashboardId}
      data-is-full-size={props.isFullSize}
      data-chart-status={props.chartStatus}
    >
      <button
        type="button"
        data-test="toggleExpandSlice"
        onClick={props.toggleExpandSlice}
      >
        toggleExpandSlice
      </button>
      <button
        type="button"
        data-test="forceRefresh"
        onClick={props.forceRefresh}
      >
        forceRefresh
      </button>

      <button
        type="button"
        data-test="exploreChart"
        onClick={props.logExploreChart}
      >
        exploreChart
      </button>

      <button type="button" data-test="exportCSV" onClick={props.exportCSV}>
        exportCSV
      </button>

      <button
        type="button"
        data-test="handleToggleFullSize"
        onClick={props.handleToggleFullSize}
      >
        handleToggleFullSize
      </button>

      <button
        type="button"
        data-test="addSuccessToast"
        onClick={props.addSuccessToast}
      >
        addSuccessToast
      </button>

      <button
        type="button"
        data-test="addDangerToast"
        onClick={props.addDangerToast}
      >
        addDangerToast
      </button>
    </div>
  ),
}));

jest.mock('src/dashboard/components/FiltersBadge', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-test="FiltersBadge" data-chart-id={props.chartId} />
  ),
}));

jest.mock('src/dashboard/util/isEmbedded', () => ({
  isEmbedded: jest.fn().mockReturnValue(false),
}));

jest.mock('src/components/UiConfigContext', () => ({
  useUiConfig: jest.fn().mockReturnValue({
    hideTitle: false,
    hideTab: false,
    hideNav: false,
    hideChartControls: false,
    emitDataMasks: false,
    showRowLimitWarning: false,
  }),
}));

const MOCKED_CHART_ID = 312;

const initialState = {
  charts: {
    [MOCKED_CHART_ID]: {
      id: MOCKED_CHART_ID,
      chartStatus: 'rendered',
      queriesResponse: [{ sql_rowcount: 0 }],
    },
  },
  dashboardInfo: {
    crossFiltersEnabled: false,
  },
  dataMask: {},
};

const createProps = (overrides: any = {}) => ({
  filters: {}, // is in typing but not being used
  editMode: false,
  annotationQuery: { param01: 'annotationQuery' } as any,
  annotationError: { param01: 'annotationError' } as any,
  cachedDttm: [] as string[],
  updatedDttm: 1617207718004,
  isCached: [false],
  isExpanded: false,
  sliceName: 'Vaccine Candidates per Phase',
  supersetCanExplore: true,
  supersetCanCSV: true,
  slice: {
    slice_id: MOCKED_CHART_ID,
    slice_url: `/explore/?form_data=%7B%22slice_id%22%3A%20${MOCKED_CHART_ID}%7D`,
    slice_name: 'Vaccine Candidates per Phase',
    form_data: {
      adhoc_filters: [],
      bottom_margin: 'auto',
      color_scheme: 'SUPERSET_DEFAULT',
      columns: [],
      datasource: '58__table',
      groupby: ['clinical_stage'],
      label_colors: {},
      metrics: ['count'],
      row_limit: 10000,
      show_legend: false,
      time_range: 'No filter',
      viz_type: VizType.Bar,
      x_ticks_layout: 'auto',
      y_axis_format: 'SMART_NUMBER',
      slice_id: MOCKED_CHART_ID,
    },
    viz_type: VizType.Bar,
    datasource: '58__table',
    description: '',
    description_markeddown: '',
    owners: [],
    modified: '<span class="no-wrap">20 hours ago</span>',
    changed_on: 1617143411366,
    slice_description: '',
  },
  componentId: 'CHART-aGfmWtliqA',
  dashboardId: 26,
  isFullSize: false,
  chartStatus: 'rendered',
  addSuccessToast: jest.fn(),
  addDangerToast: jest.fn(),
  handleToggleFullSize: jest.fn(),
  updateSliceName: jest.fn(),
  toggleExpandSlice: jest.fn(),
  forceRefresh: jest.fn(),
  logExploreChart: jest.fn(),
  logEvent: jest.fn(),
  exportCSV: jest.fn(),
  formData: { slice_id: 1, datasource: '58__table' },
  width: 100,
  height: 100,
  ...overrides,
});

test('Should render', () => {
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(screen.getByTestId('slice-header')).toBeInTheDocument();
});

test('Should render - default props', () => {
  const props = createProps();

  // @ts-ignore
  delete props.forceRefresh;
  // @ts-ignore
  delete props.updateSliceName;
  // @ts-ignore
  delete props.toggleExpandSlice;
  // @ts-ignore
  delete props.logExploreChart;
  // @ts-ignore
  delete props.exportCSV;
  // @ts-ignore
  delete props.innerRef;
  // @ts-ignore
  delete props.editMode;
  // @ts-ignore
  delete props.annotationQuery;
  // @ts-ignore
  delete props.annotationError;
  // @ts-ignore
  delete props.cachedDttm;
  // @ts-ignore
  delete props.updatedDttm;
  // @ts-ignore
  delete props.isCached;
  // @ts-ignore
  delete props.isExpanded;
  // @ts-ignore
  delete props.sliceName;
  // @ts-ignore
  delete props.supersetCanExplore;
  // @ts-ignore
  delete props.supersetCanCSV;

  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(screen.getByTestId('slice-header')).toBeInTheDocument();
});

test('Should render default props and "call" actions', () => {
  const props = createProps();

  // @ts-ignore
  delete props.forceRefresh;
  // @ts-ignore
  delete props.updateSliceName;
  // @ts-ignore
  delete props.toggleExpandSlice;
  // @ts-ignore
  delete props.logExploreChart;
  // @ts-ignore
  delete props.exportCSV;
  // @ts-ignore
  delete props.innerRef;
  // @ts-ignore
  delete props.editMode;
  // @ts-ignore
  delete props.annotationQuery;
  // @ts-ignore
  delete props.annotationError;
  // @ts-ignore
  delete props.cachedDttm;
  // @ts-ignore
  delete props.updatedDttm;
  // @ts-ignore
  delete props.isCached;
  // @ts-ignore
  delete props.isExpanded;
  // @ts-ignore
  delete props.sliceName;
  // @ts-ignore
  delete props.supersetCanExplore;
  // @ts-ignore
  delete props.supersetCanCSV;

  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  userEvent.click(screen.getByTestId('toggleExpandSlice'));
  userEvent.click(screen.getByTestId('forceRefresh'));
  userEvent.click(screen.getByTestId('exploreChart'));
  userEvent.click(screen.getByTestId('exportCSV'));
  userEvent.click(screen.getByTestId('addSuccessToast'));
  userEvent.click(screen.getByTestId('addDangerToast'));
  userEvent.click(screen.getByTestId('handleToggleFullSize'));
  expect(screen.getByTestId('slice-header')).toBeInTheDocument();
});

test('Should render title', () => {
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(screen.getByText('Vaccine Candidates per Phase')).toBeInTheDocument();
});

test('Should render click to edit prompt and run onExploreChart on click', async () => {
  const props = createProps();
  const history = createMemoryHistory({
    initialEntries: ['/superset/dashboard/1/'],
  });
  render(
    <Router history={history}>
      <SliceHeader {...props} />
    </Router>,
    { useRedux: true, initialState },
  );
  userEvent.hover(screen.getByText('Vaccine Candidates per Phase'));
  expect(
    await screen.findByText('Click to edit Vaccine Candidates per Phase.'),
  ).toBeInTheDocument();
  expect(
    await screen.findByText('Use ctrl + click to open in a new tab.'),
  ).toBeInTheDocument();

  userEvent.click(screen.getByText('Vaccine Candidates per Phase'));
  expect(history.location.pathname).toMatch('/explore');
});

test('Display cmd button in tooltip if running on MacOS', async () => {
  jest.spyOn(window.navigator, 'appVersion', 'get').mockReturnValue('Mac');
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  userEvent.hover(screen.getByText('Vaccine Candidates per Phase'));
  expect(
    await screen.findByText('Click to edit Vaccine Candidates per Phase.'),
  ).toBeInTheDocument();
  expect(
    await screen.findByText('Use ⌘ + click to open in a new tab.'),
  ).toBeInTheDocument();
});

test('Should not render click to edit prompt and run onExploreChart on click if supersetCanExplore=false', () => {
  const props = createProps({ supersetCanExplore: false });
  const history = createMemoryHistory({
    initialEntries: ['/superset/dashboard/1/'],
  });
  render(
    <Router history={history}>
      <SliceHeader {...props} />
    </Router>,
    { useRedux: true, initialState },
  );
  userEvent.hover(screen.getByText('Vaccine Candidates per Phase'));
  expect(
    screen.queryByText(
      'Click to edit Vaccine Candidates per Phase in a new tab',
    ),
  ).not.toBeInTheDocument();

  userEvent.click(screen.getByText('Vaccine Candidates per Phase'));
  expect(history.location.pathname).toMatch('/superset/dashboard');
});

test('Should not render click to edit prompt and run onExploreChart on click if in edit mode', () => {
  const props = createProps({ editMode: true });
  const history = createMemoryHistory({
    initialEntries: ['/superset/dashboard/1/'],
  });
  render(
    <Router history={history}>
      <SliceHeader {...props} />
    </Router>,
    { useRedux: true, initialState },
  );
  userEvent.hover(screen.getByText('Vaccine Candidates per Phase'));
  expect(
    screen.queryByText(
      'Click to edit Vaccine Candidates per Phase in a new tab',
    ),
  ).not.toBeInTheDocument();

  userEvent.click(screen.getByText('Vaccine Candidates per Phase'));
  expect(history.location.pathname).toMatch('/superset/dashboard');
});

test('Should render "annotationsLoading"', () => {
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(
    screen.getByRole('img', {
      name: 'Annotation layers are still loading.',
    }),
  ).toBeInTheDocument();
});

test('Should render "annotationsError"', () => {
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(
    screen.getByRole('img', {
      name: 'One or more annotation layers failed loading.',
    }),
  ).toBeInTheDocument();
});

test('Should not render "annotationsError" and "annotationsLoading"', () => {
  const props = createProps();
  props.annotationQuery = {};
  props.annotationError = {};
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(
    screen.queryByRole('img', {
      name: 'One or more annotation layers failed loading.',
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('img', {
      name: 'Annotation layers are still loading.',
    }),
  ).not.toBeInTheDocument();
});

test('Correct props to "FiltersBadge"', () => {
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(screen.getByTestId('FiltersBadge')).toHaveAttribute(
    'data-chart-id',
    `${MOCKED_CHART_ID}`,
  );
});

test('Correct props to "SliceHeaderControls"', () => {
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-cached-dttm',
    '',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-chart-status',
    'rendered',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-component-id',
    'CHART-aGfmWtliqA',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-dashboard-id',
    '26',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-is-cached',
    'false',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-is-expanded',
    'false',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-is-full-size',
    'false',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-superset-can-csv',
    'true',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-superset-can-explore',
    'true',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-test',
    'SliceHeaderControls',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-updated-dttm',
    '1617207718004',
  );
  expect(screen.getByTestId('SliceHeaderControls')).toHaveAttribute(
    'data-slice',
    JSON.stringify(props.slice),
  );
});

test('Correct actions to "SliceHeaderControls"', () => {
  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });

  expect(props.toggleExpandSlice).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByTestId('toggleExpandSlice'));
  expect(props.toggleExpandSlice).toHaveBeenCalledTimes(1);

  expect(props.forceRefresh).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByTestId('forceRefresh'));
  expect(props.forceRefresh).toHaveBeenCalledTimes(1);

  expect(props.logExploreChart).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByTestId('exploreChart'));
  expect(props.logExploreChart).toHaveBeenCalledTimes(1);

  expect(props.exportCSV).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByTestId('exportCSV'));
  expect(props.exportCSV).toHaveBeenCalledTimes(1);

  expect(props.addSuccessToast).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByTestId('addSuccessToast'));
  expect(props.addSuccessToast).toHaveBeenCalledTimes(1);

  expect(props.addDangerToast).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByTestId('addDangerToast'));
  expect(props.addDangerToast).toHaveBeenCalledTimes(1);

  expect(props.handleToggleFullSize).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByTestId('handleToggleFullSize'));
  expect(props.handleToggleFullSize).toHaveBeenCalledTimes(1);
});

test('Add extension to SliceHeader', () => {
  const extensionsRegistry = getExtensionsRegistry();
  extensionsRegistry.set('dashboard.slice.header', () => (
    <div>This is an extension</div>
  ));

  const props = createProps();
  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState,
  });

  expect(screen.getByText('This is an extension')).toBeInTheDocument();
});

test('Should render RowCountLabel when row limit is hit, and hide it otherwise', () => {
  const props = createProps({
    formData: {
      ...createProps().formData,
      row_limit: 10,
    },
  });
  const rowCountState = {
    ...initialState,
    charts: {
      [props.slice.slice_id]: {
        queriesResponse: [
          {
            sql_rowcount: 10,
          },
        ],
      },
    },
  };

  const { rerender } = render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState: rowCountState,
  });

  expect(screen.getByTestId('warning')).toBeInTheDocument();
  rerender(
    <SliceHeader
      {...props}
      formData={{ ...props.formData, row_limit: 1000 }}
    />,
  );

  expect(screen.queryByTestId('warning')).not.toBeInTheDocument();
});

test('Should hide RowCountLabel in embedded by default', () => {
  const mockIsEmbedded = isEmbedded as jest.MockedFunction<typeof isEmbedded>;
  mockIsEmbedded.mockReturnValue(true);

  const props = createProps({
    formData: {
      ...createProps().formData,
      row_limit: 10,
    },
  });
  const rowCountState = {
    ...initialState,
    charts: {
      [props.slice.slice_id]: {
        queriesResponse: [
          {
            sql_rowcount: 10,
          },
        ],
      },
    },
  };

  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState: rowCountState,
  });

  expect(screen.queryByTestId('warning')).not.toBeInTheDocument();

  mockIsEmbedded.mockRestore();
});

test('Should show RowCountLabel in embedded when uiConfig.showRowLimitWarning is true', () => {
  const mockIsEmbedded = isEmbedded as jest.MockedFunction<typeof isEmbedded>;
  const mockUseUiConfig = useUiConfig as jest.MockedFunction<
    typeof useUiConfig
  >;

  mockIsEmbedded.mockReturnValue(true);
  mockUseUiConfig.mockReturnValue({
    hideTitle: false,
    hideTab: false,
    hideNav: false,
    hideChartControls: false,
    emitDataMasks: false,
    showRowLimitWarning: true,
  });

  const props = createProps({
    formData: {
      ...createProps().formData,
      row_limit: 10,
    },
  });
  const rowCountState = {
    ...initialState,
    charts: {
      [props.slice.slice_id]: {
        queriesResponse: [
          {
            sql_rowcount: 10,
          },
        ],
      },
    },
  };

  render(<SliceHeader {...props} />, {
    useRedux: true,
    useRouter: true,
    initialState: rowCountState,
  });

  expect(screen.getByTestId('warning')).toBeInTheDocument();

  mockIsEmbedded.mockRestore();
  mockUseUiConfig.mockRestore();
});

import React from 'react';
import { renderShallowly } from '@flopflip/test-utils';
import { ConfigureAdapter } from '@flopflip/react';
import { FlagsContext } from '../flags-context';
import Configure from './configure';

const ChildComponent = () => <div />;

const createTestProps = custom => ({
  adapter: {
    configure: jest.fn(),
    reconfigure: jest.fn(),
    getIsReady: jest.fn(),
  },
  adapterArgs: {
    fooId: 'foo-id',
  },

  ...custom,
});

describe('rendering', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = createTestProps();
    wrapper = renderShallowly(
      <Configure {...props}>
        <ChildComponent />
      </Configure>
    );
  });

  it('should render a `<ConfigureAdapter>`', () => {
    expect(wrapper).toRender(ConfigureAdapter);
  });

  it('should render a `<FlagsContext.Provider>`', () => {
    expect(wrapper).toRender(FlagsContext.Provider);
  });

  describe('with `children`', () => {
    let props;

    beforeEach(() => {
      props = createTestProps();

      wrapper = renderShallowly(
        <Configure {...props}>
          <ChildComponent />
        </Configure>
      );
    });

    it('should render `children`', () => {
      expect(wrapper).toRender(ChildComponent);
    });
  });

  describe('`of <ConfigureAdapter />`', () => {
    let configureAdapterWrapper;

    beforeEach(() => {
      configureAdapterWrapper = wrapper.find(ConfigureAdapter);
    });

    it('should receive `adapterArgs`', () => {
      expect(configureAdapterWrapper).toHaveProp(
        'adapterArgs',
        expect.objectContaining({})
      );
    });

    it('should receive `onStatusStateChange` and `onFlagsStateChange` in `adapterArgs`', () => {
      expect(configureAdapterWrapper).toHaveProp(
        'adapterArgs',
        expect.objectContaining({
          onStatusStateChange: wrapper.instance().handleUpdateStatus,
          onFlagsStateChange: wrapper.instance().handleUpdateFlags,
        })
      );
    });

    it('should receive `defaultFlags`', () => {
      expect(configureAdapterWrapper).toHaveProp(
        'defaultFlags',
        Configure.defaultProps.defaultFlags
      );
    });
  });
});

describe('state', () => {
  let props;
  let wrapper;

  describe('when updating flags', () => {
    const newFlags = { flag1: true, flag2: false };

    beforeEach(() => {
      props = createTestProps();
      wrapper = renderShallowly(
        <Configure {...props}>
          <ChildComponent />
        </Configure>
      );

      wrapper.instance().handleUpdateFlags(newFlags);
    });

    it('should update the state', () => {
      expect(wrapper).toHaveState('flags', newFlags);
    });
  });

  describe('handleUpdateStatus', () => {
    const newStatus = { isReady: true };

    beforeEach(() => {
      props = createTestProps();
      wrapper = renderShallowly(
        <Configure {...props}>
          <ChildComponent />
        </Configure>
      );

      wrapper.instance().handleUpdateStatus(newStatus);
    });

    it('should update the state', () => {
      expect(wrapper).toHaveState(
        'status',
        expect.objectContaining({ isReady: newStatus.isReady })
      );
    });
  });

  describe('of `<FlagsContext.Provider />`', () => {
    it('should receive `flags` as `value`', () => {
      expect(wrapper.find(FlagsContext.Provider)).toHaveProp(
        'value',
        wrapper.state('flags')
      );
    });
  });
});

describe('statics', () => {
  describe('displayName', () => {
    it('should be set to `ConfigureFlopflip`', () => {
      expect(Configure.displayName).toEqual('ConfigureFlopflip');
    });
  });

  describe('defaultProps', () => {
    it('should default `defaultFlags` to an empty object', () => {
      expect(Configure.defaultProps.defaultFlags).toEqual({});
    });

    it('should default `shouldDeferAdapterConfiguration` to `true`', () => {
      expect(Configure.defaultProps.shouldDeferAdapterConfiguration).toBe(
        false
      );
    });
  });
});

import invariant from 'invariant';
import mitt, { Emitter } from 'mitt';
import {
  User,
  AdapterStatus,
  AdapterArgs,
  FlagName,
  FlagVariation,
  Flags,
} from '@flopflip/types';

type MemoryAdapterState = {
  flags: Flags;
  user?: User;
  emitter: Emitter;
};

const intialAdapterState: AdapterStatus & MemoryAdapterState = {
  isReady: false,
  flags: {},
  user: {},
  // Typings are incorrect and state that mitt is not callable.
  // Value of type 'MittStatic' is not callable. Did you mean to include 'new'
  // @ts-ignore
  emitter: mitt(),
};

let adapterState: AdapterStatus & MemoryAdapterState = {
  ...intialAdapterState,
};

const configure = ({
  user,
  onFlagsStateChange,
  onStatusStateChange,
}: AdapterArgs): Promise<any> => {
  adapterState.user = user;

  return Promise.resolve().then(() => {
    adapterState.isConfigured = true;
    adapterState.isReady = true;
    adapterState.flags = {};

    updateUser(user);

    adapterState.emitter.on('flagsStateChange', onFlagsStateChange);
    adapterState.emitter.on('statusStateChange', onStatusStateChange);

    adapterState.emitter.emit('flagsStateChange', adapterState.flags);
    adapterState.emitter.emit('statusStateChange', {
      isReady: adapterState.isReady,
      isConfigured: adapterState.isConfigured,
    });

    adapterState.emitter.emit('readyStateChange');
  });
};

const reconfigure = ({ user }: { user: User }): Promise<any> => {
  updateUser(user);

  adapterState.flags = {};
  adapterState.emitter.emit('flagsStateChange', adapterState.flags);
  adapterState.emitter.emit('statusStateChange', {
    isConfigured: adapterState.isConfigured,
  });

  return Promise.resolve();
};

const getIsReady = (): boolean => Boolean(adapterState.isReady);
const setIsReady = (nextIsReady: { isReady: boolean }): void => {
  adapterState.isReady = nextIsReady.isReady;

  adapterState.emitter.emit('statusStateChange', {
    isReady: adapterState.isReady,
  });
};

const reset = (): void => {
  adapterState = {
    ...intialAdapterState,
  };
};

const updateUser = (user: User): void => {
  adapterState.user = user;
};

export const updateFlags = (flags: Flags): void => {
  const isAdapterReady = Boolean(
    adapterState.isConfigured && adapterState.isReady
  );

  invariant(
    isAdapterReady,
    '@flopflip/memory-adapter: adapter not ready and configured. Flags can not be updated before.'
  );

  if (!isAdapterReady) return;

  adapterState.flags = {
    ...adapterState.flags,
    ...flags,
  };

  adapterState.emitter.emit('flagsStateChange', adapterState.flags);
};

export const getUser = (): User | undefined => adapterState.user;
const waitUntilConfigured = (): Promise<any> =>
  new Promise(resolve => {
    if (adapterState.isConfigured) resolve();
    else adapterState.emitter.on('readyStateChange', resolve);
  });

const getFlag = (flagName: FlagName): FlagVariation | undefined =>
  adapterState.flags && adapterState.flags[flagName];

export default {
  getIsReady,
  setIsReady,
  waitUntilConfigured,
  getFlag,
  reset,
  configure,
  reconfigure,
};

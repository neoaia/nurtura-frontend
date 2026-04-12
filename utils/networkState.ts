import { NetInfoState } from "@react-native-community/netinfo";

export interface NetworkSnapshot {
  isReady: boolean;
  connectionType: NetInfoState["type"] | "unknown";
  isConnected: boolean;
  isInternetReachable: boolean;
  hasNetworkConnection: boolean;
  hasWifiConnection: boolean;
}

const defaultSnapshot: NetworkSnapshot = {
  isReady: false,
  connectionType: "unknown",
  isConnected: true,
  isInternetReachable: true,
  hasNetworkConnection: true,
  hasWifiConnection: true,
};

let currentSnapshot = defaultSnapshot;

export function toNetworkSnapshot(state: NetInfoState): NetworkSnapshot {
  const isConnected = state.isConnected ?? false;
  const isInternetReachable = state.isInternetReachable ?? isConnected;
  const hasNetworkConnection = isConnected && isInternetReachable !== false;
  const hasWifiConnection = state.type === "wifi" && hasNetworkConnection;

  return {
    isReady: true,
    connectionType: state.type,
    isConnected,
    isInternetReachable,
    hasNetworkConnection,
    hasWifiConnection,
  };
}

export function updateNetworkSnapshot(state: NetInfoState): NetworkSnapshot {
  currentSnapshot = toNetworkSnapshot(state);
  return currentSnapshot;
}

export function getNetworkSnapshot(): NetworkSnapshot {
  return currentSnapshot;
}

export function hasNetworkConnection(): boolean {
  return currentSnapshot.hasNetworkConnection;
}

export function hasWifiConnection(): boolean {
  return currentSnapshot.hasWifiConnection;
}

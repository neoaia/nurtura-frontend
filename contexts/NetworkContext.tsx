import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    getNetworkSnapshot,
    NetworkSnapshot,
    updateNetworkSnapshot,
} from "../utils/networkState";
import { abortTrackedRequests } from "../utils/requestRegistry";

export type NetworkToastTone = "offline" | "online";

export interface NetworkToastState {
  tone: NetworkToastTone;
  message: string;
}

interface NetworkContextValue extends NetworkSnapshot {
  toast: NetworkToastState | null;
  dismissToast: () => void;
}

const NetworkContext = createContext<NetworkContextValue>(
  {} as NetworkContextValue,
);

export const useNetwork = () => useContext(NetworkContext);

const createOfflineToast = (): NetworkToastState => ({
  tone: "offline",
  message: "No wifi connection",
});

const createOnlineToast = (): NetworkToastState => ({
  tone: "online",
  message: "Connection restored",
});

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [snapshot, setSnapshot] =
    useState<NetworkSnapshot>(getNetworkSnapshot());
  const [toast, setToast] = useState<NetworkToastState | null>(null);
  const lastWifiConnectionRef = useRef<boolean | null>(null);

  const updateToastForWifiState = useCallback((hasWifiConnection: boolean) => {
    const previousHasWifiConnection = lastWifiConnectionRef.current;
    lastWifiConnectionRef.current = hasWifiConnection;

    if (!hasWifiConnection) {
      abortTrackedRequests();

      if (previousHasWifiConnection !== false) {
        setToast(createOfflineToast());
      }

      return;
    }

    if (previousHasWifiConnection === false) {
      setToast(createOnlineToast());
    }
  }, []);

  const applyNetworkState = useCallback(
    (state: NetInfoState) => {
      const nextSnapshot = updateNetworkSnapshot(state);
      setSnapshot(nextSnapshot);
      updateToastForWifiState(nextSnapshot.hasWifiConnection);
    },
    [updateToastForWifiState],
  );

  useEffect(() => {
    let isActive = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!isActive) return;
      applyNetworkState(state);
    });

    NetInfo.fetch()
      .then((state) => {
        if (isActive) {
          applyNetworkState(state);
        }
      })
      .catch(() => {
        // keep the default snapshot until NetInfo resolves
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [applyNetworkState]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = useMemo(
    () => ({
      ...snapshot,
      toast,
      dismissToast,
    }),
    [dismissToast, snapshot, toast],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

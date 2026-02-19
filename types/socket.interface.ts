export interface SensorReading {
  id: string;
  rackId: string;
  temperature: number;
  humidity: number;
  moisture: number;
  waterLevel: number;
  timestamp: Date | string;
  lightIntensity?: number;
}

export interface Notification {
  id: string;
  userId: string;
  rackId: string;
  type: string;
  message: string;
  severity: string;
  timestamp: Date | string;
  isRead: boolean;
}

export interface ServerToClientEvents {
  connected: (data: { message: string; userId: string }) => void;
  subscribed: (data: { message: string; rackId: string }) => void;
  unsubscribed: (data: { message: string; rackId: string }) => void;
  initialData: (data: { rackId: string; data: SensorReading | null }) => void;
  sensorData: (data: {
    rackId: string;
    data: SensorReading;
    timestamp: Date | string;
  }) => void;
  deviceStatus: (data: {
    rackId: string;
    status: string;
    timestamp: Date | string;
  }) => void;
  alert: (data: {
    rackId: string;
    notification: Notification;
    timestamp: Date | string;
  }) => void;
  status: (data: {
    connected: boolean;
    clientId: string;
    subscribedRacks: string[];
    totalConnections: number;
  }) => void;
  error: (data: { message: string; error: Error }) => void;
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
}

export interface ClientToServerEvents {
  subscribeToRack: (data: { rackId: string; userId: string }) => void;
  unsubscribeFromRack: (data: { rackId: string }) => void;
  getStatus: () => void;
}

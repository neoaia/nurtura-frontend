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

export type AutomationEventType =
  | "WATERING_START"
  | "WATERING_STOP"
  | "LIGHT_ON"
  | "LIGHT_OFF";

export interface AutomationActivity {
  id: string;
  rackId: string;
  eventType: AutomationEventType;
  details: string;
  metadata: {
    rackName: string;
    macAddress: string;
    source: string;
    plantId: string;
    plantName: string;
    ruleId: string;
    ruleName: string;
    waterUsedMl?: number;
    durationSeconds?: number;
  };
  timestamp: Date | string;
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
  userNotification: (data: {
    notification: Notification;
    timestamp: string;
  }) => void;
  /**
   * Fired when an automation rule executes a watering or lighting action.
   * Address: `automationEvent` (see AsyncAPI spec › automationEventTriggered channel)
   */
  automationEvent: (data: {
    event: AutomationEventType;
    activity: AutomationActivity;
  }) => void;
  error: (data: { message: string; error: Error }) => void;
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
}

export interface ClientToServerEvents {
  subscribeToRack: (data: { rackId: string }) => void;
  unsubscribeFromRack: (data: { rackId: string }) => void;
  getStatus: () => void;
  subscribeToUserNotifications: () => void;
  unsubscribeFromUserNotifications: () => void;
  subscribeToUserNotificationsAck: () => void;
  unsubscribeFromUserNotificationsAck: () => void;
}

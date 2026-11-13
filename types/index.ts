/** Firestore Timestamp veya agent'ın yazdığı ISO string */
export type FirestoreTime = { toDate(): Date } | Date | string | null;

// ── Makine ──────────────────────────────────────────────────────────────────

/** Agent'ın doğrudan yazdığı kök doküman (machines/{machineGuid}) */
export interface MachineDoc {
  machineGuid: string;
  computerName: string;
  username: string;
  label: string;
  lastSeenUtc: string; // ISO 8601
}

/** API'nin yazdığı durum alt dokümanı (machines/{id}/state/current) */
export interface MachineState {
  status: "running" | "paused" | "offline";
  lastSeenAt: FirestoreTime;
  lastEventAt: FirestoreTime;
  lastBootAt: FirestoreTime;
  agentVersion: string;
  pendingCount: number;
  configVersion: number;
  heartbeatIntervalSeconds: number;
}

/** Panelin yazdığı ayarlar alt dokümanı (machines/{id}/settings/current) */
export interface MachineSettings {
  displayName: string | null;
  trackedApps: string[];
  ignoredApps: string[];
  trackSystemEvents: boolean;
  heartbeatIntervalSeconds: number;
  configVersion: number;
}

// ── Olay ────────────────────────────────────────────────────────────────────

export type EventType =
  | "agent_started"
  | "agent_stopped"
  | "system_started"
  | "system_shutdown"
  | "system_restart"
  | "system_unexpected_shutdown"
  | "system_sleep"
  | "system_resume"
  | "system_hibernate"
  | "session_logon"
  | "session_logoff"
  | "session_lock"
  | "session_unlock"
  | "process_started"
  | "process_stopped"
  | "tracking_paused"
  | "tracking_resumed";

export const EVENT_TYPES: readonly EventType[] = [
  "agent_started",
  "agent_stopped",
  "system_started",
  "system_shutdown",
  "system_restart",
  "system_unexpected_shutdown",
  "system_sleep",
  "system_resume",
  "system_hibernate",
  "session_logon",
  "session_logoff",
  "session_lock",
  "session_unlock",
  "process_started",
  "process_stopped",
  "tracking_paused",
  "tracking_resumed",
];

export const SYSTEM_EVENT_TYPES: readonly EventType[] = [
  "system_started",
  "system_shutdown",
  "system_restart",
  "system_unexpected_shutdown",
  "system_sleep",
  "system_resume",
  "system_hibernate",
  "session_logon",
  "session_logoff",
  "session_lock",
  "session_unlock",
  "agent_started",
  "agent_stopped",
  "tracking_paused",
  "tracking_resumed",
];

export const PROCESS_EVENT_TYPES: readonly EventType[] = [
  "process_started",
  "process_stopped",
];

export interface EventFlags {
  initial?: boolean;
  inferred?: boolean;
  [key: string]: unknown;
}

/** Firestore'daki olay dokümanı (machines/{id}/events/{eventId}) */
export interface EventDoc {
  eventId: string;
  eventType: EventType;
  processName: string | null;
  displayName: string | null;
  sessionKey: string | null;
  durationSeconds: number | null;
  flags: EventFlags;
  occurredAt: FirestoreTime;
  seq: number;
  receivedAt: FirestoreTime;
  /** "app" = kullanıcı uygulaması, "windows" = Windows sistem uygulaması, "" = bilinmiyor */
  category?: string;
}

// ── Giriş kaydı ─────────────────────────────────────────────────────────────

/** Agent'ın yazdığı giriş kaydı (machines/{id}/logins/{loginId}) */
export interface LoginDoc {
  event: "agent_started";
  machineGuid: string;
  username: string;
  computerName: string;
  osVersion: string;
  agentVersion: string;
  startedAtUtc: string;
  startedAtLocal: string;
}

// ── İstatistik ───────────────────────────────────────────────────────────────

export interface DailyAppEntry {
  displayName: string;
  launches: number;
  seconds: number;
}

/** Günlük istatistik dokümanı (machines/{id}/dailyStats/{yyyy-MM-dd}) */
export interface DailyStatsDoc {
  eventCount: number;
  appLaunchCount: number;
  totalActiveSeconds: number;
  apps: Record<string, DailyAppEntry>;
}

/** Uygulama istatistik dokümanı (machines/{id}/appStats/{appKey}) */
export interface AppStatsDoc {
  displayName: string;
  processName: string;
  lastStartedAt: FirestoreTime;
  lastStoppedAt: FirestoreTime;
  totalSeconds: number;
  launchCount: number;
  isRunning: boolean;
}

// ── API İstek / Yanıt tipleri ────────────────────────────────────────────────

export interface ApiEventPayload {
  eventId: string;
  seq: number;
  eventType: string;
  processName?: string | null;
  displayName?: string | null;
  sessionKey?: string | null;
  durationSeconds?: number | null;
  flags?: EventFlags;
  occurredAtUtc: string;
}

export interface ApiEventsRequest {
  deviceId: string;
  events: ApiEventPayload[];
}

export interface ApiEventResult {
  eventId: string;
  status: "accepted" | "duplicate" | "rejected";
}

export interface ApiEventsResponse {
  results: ApiEventResult[];
}

export interface ApiHeartbeatRequest {
  deviceId: string;
  status: "running" | "paused";
  agentVersion: string;
  pendingCount: number;
  configVersion: number;
}

export interface ApiHeartbeatResponse {
  serverTimeUtc: string;
  configVersion: number;
}

export interface ApiConfigResponse {
  configVersion: number;
  trackedApps: string[];
  ignoredApps: string[];
  trackSystemEvents: boolean;
  heartbeatIntervalSeconds: number;
}

export interface ApiPairRequest {
  code: string;
  machineGuid: string;
  computerName: string;
  label: string;
  agentVersion: string;
}

export interface ApiPairResponse {
  deviceId: string;
  deviceKey: string;
}

/**
 * Notification Store — Zustand-based global toast notification system.
 * Centralized feedback for dashboard actions.
 */

import { create } from "zustand";

let idCounter = 0;

type NotificationType = "success" | "error" | "warning" | "info";

type NotificationInput = {
  type?: NotificationType;
  message: string;
  title?: string | null;
  duration?: number;
  dismissible?: boolean;
};

type Notification = Required<Omit<NotificationInput, "title">> & {
  id: number;
  title: string | null;
  createdAt: number;
};

type NotificationStore = {
  notifications: Notification[];
  addNotification: (notification: NotificationInput) => number;
  removeNotification: (id: number) => void;
  clearAll: () => void;
  success: (message: string, title?: string) => number;
  error: (message: string, title?: string) => number;
  warning: (message: string, title?: string) => number;
  info: (message: string, title?: string) => number;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = ++idCounter;
    const entry = {
      id,
      type: notification.type || "info",
      message: notification.message,
      title: notification.title || null,
      duration: notification.duration ?? 5000,
      dismissible: notification.dismissible ?? true,
      createdAt: Date.now(),
    };

    set((s) => ({ notifications: [...s.notifications, entry] }));

    // Auto-dismiss
    if (entry.duration > 0) {
      setTimeout(() => get().removeNotification(id), entry.duration);
    }

    return id;
  },

  removeNotification: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },

  clearAll: () => set({ notifications: [] }),

  success: (message, title) => get().addNotification({ type: "success", message, title }),
  error: (message, title) => get().addNotification({ type: "error", message, title, duration: 8000 }),
  warning: (message, title) => get().addNotification({ type: "warning", message, title }),
  info: (message, title) => get().addNotification({ type: "info", message, title }),
}));

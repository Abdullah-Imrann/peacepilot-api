"use client";

import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";

type Notification = {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const push = useCallback((message: string, type: Notification["type"] = "info") => {
    const item = { id: uuid(), message, type };
    setNotifications((prev) => [...prev, item]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    }, 3200);
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, push, remove };
}


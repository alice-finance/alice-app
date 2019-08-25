import React, { useEffect, useReducer, useState } from "react";
import { AsyncStorage, Platform } from "react-native";

import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import SnackBar from "../utils/SnackBar";

const reducer = (notifications, newNotifications) => {
    if (newNotifications === null) {
        AsyncStorage.removeItem("local-notifications");
        return {};
    }
    return { ...notifications, ...newNotifications };
};

export interface LocalNotificationParams {
    path: string;
    title: string;
    body: string;
    time: number | Date;
    repeat?: "minute" | "hour" | "day" | "week" | "month" | "year" | undefined;
    intervalMs?: number | undefined;
}

export const NotificationContext = React.createContext({
    useNotification: false,
    scheduleLocalNotification: (params: LocalNotificationParams) => {}
});

export const NotificationProvider = ({ children }) => {
    const channelId = "AliceFinanceNotification";
    const [useNotification, setUseNotification] = useState<boolean>(false);
    const [localNotificationsLoaded, setLocalNotificationsLoaded] = useState<boolean>(false);
    const [notifications, setNotifications] = useReducer(reducer, {});

    useEffect(() => {
        AsyncStorage.getItem("local-notifications").then(n => {
            if (n) {
                setNotifications(JSON.parse(n));
            }
            setLocalNotificationsLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (localNotificationsLoaded) {
            const data = JSON.stringify(notifications);
            AsyncStorage.setItem("local-notifications", data);
        }
    }, [notifications, localNotificationsLoaded]);

    const handleNotification = notification => {
        // if App is open and foregrounded
        if (notification.origin === "received") {
            if (Platform.OS === "ios") {
                SnackBar.info(notification.data.body, "top");
            }
        } else if (notification.origin === "selected") {
            // app is opened or foregrounded by selecting the push notification
        }
    };

    const createChannel = () => {
        if (Platform.OS === "android") {
            Notifications.createChannelAndroidAsync(channelId, {
                name: "Notification",
                sound: true,
                priority: "max",
                vibrate: true
            });
        }
    };

    const addNotification = (path, id) => {
        if (notifications.hasOwnProperty(path)) {
            const prevId = notifications[path];
            Notifications.cancelScheduledNotificationAsync(prevId);
        }

        setNotifications({ ...notifications, [path]: id });
    };

    const scheduleLocalNotification = async (params: LocalNotificationParams) => {
        const id = await Notifications.scheduleLocalNotificationAsync(
            {
                title: params.title,
                body: params.body,
                data: {
                    title: params.title,
                    body: params.body,
                    isLocal: true
                },
                ios: {
                    sound: true
                },
                android: {
                    channelId
                }
            },
            {
                time: params.time,
                repeat: params.repeat,
                intervalMs: params.intervalMs
            }
        );
        addNotification(params.path, id);
    };

    useEffect(() => {
        if (!useNotification) {
            const requireNotification = async () => {
                const result = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                if (result.status === "granted") {
                    setUseNotification(true);
                    createChannel();
                    Notifications.addListener(handleNotification);
                } else {
                    setUseNotification(false);
                }
            };
            requireNotification();
        }
    }, [useNotification]);
    return (
        <NotificationContext.Provider value={{ useNotification, scheduleLocalNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const NotificationConsumer = NotificationContext.Consumer;

import React, { useCallback, useEffect } from "react";

import { Notifications } from "expo";

export const NotificationContext = React.createContext({
    scheduleLocalNotification: (notification: any, schedulingOptions: {}) => { }
});

const handleNotification = (notification: any) => {
    console.log(notification);
};

export const NotificationProvider = ({ children }) => {
    useEffect(() => {
        Notifications.addListener(handleNotification);
    }, []);

    const scheduleLocalNotification = useCallback((notification, schedulingOptions) => {
        Notifications.scheduleLocalNotificationAsync(notification, schedulingOptions);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                scheduleLocalNotification
            }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const NotificationConsumer = NotificationContext.Consumer;

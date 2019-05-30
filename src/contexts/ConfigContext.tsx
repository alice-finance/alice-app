import React, { useEffect, useState } from "react";
import { AsyncStorage } from "react-native";

export const ConfigContext = React.createContext({
    currentMarketAddress: "",
    setCurrentMarketAddress: address => {}
});

export const ConfigProvider = ({ children }) => {
    const [currentMarketAddress, setCurrentMarketAddress] = useState<string>("");
    useEffect(() => {
        AsyncStorage.setItem("currentMarketAddress", currentMarketAddress);
    }, [currentMarketAddress]);
    return (
        <ConfigContext.Provider value={{ currentMarketAddress, setCurrentMarketAddress }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const ConfigConsumer = ConfigContext.Consumer;

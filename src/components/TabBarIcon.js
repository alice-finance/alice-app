import React from "react";
import { Platform } from "react-native";
import { Icon } from "native-base";

const TabBarIcon = ({ name, tintColor }) => (
    <Icon
        type="SimpleLineIcons"
        name={name}
        style={{
            marginTop: Platform.OS === "ios" ? 8 : 0,
            color: tintColor,
            fontSize: Platform.OS === "ios" ? 20 : 22
        }}
    />
);

export default TabBarIcon;

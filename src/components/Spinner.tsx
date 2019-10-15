import React from "react";
import { View } from "react-native";

import { Spinner as NativeSpinner, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { Spacing } from "../constants/dimension";

const Spinner = ({ compact = false, small = false, label = "", color = platform.brandPrimary }) => (
    <View>
        <NativeSpinner
            color={color}
            size={small ? "small" : "large"}
            style={{ marginTop: compact ? 0 : Spacing.huge * 2 }}
        />
        {label.length > 0 && <Text style={{ alignSelf: "center", color: "grey" }}>{label}</Text>}
    </View>
);

export default Spinner;

import React from "react";
import { View } from "react-native";

import { Text } from "native-base";
import preset from "../styles/preset";

const Row = ({ label, value, error = false }) => (
    <View style={[preset.flexDirectionRow, preset.marginTopTiny, preset.marginBottomTiny]}>
        <Text style={[preset.flex0, preset.colorGrey, preset.fontSize16, error && preset.colorDanger]}>{label}</Text>
        <Text style={[preset.flex1, preset.textAlignRight, preset.fontSize16, error && preset.colorDanger]}>
            {value}
        </Text>
    </View>
);

export default Row;

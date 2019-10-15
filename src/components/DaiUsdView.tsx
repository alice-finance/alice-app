import React from "react";
import { View } from "react-native";

import { Card, Text } from "native-base";
import preset from "../styles/preset";

const DaiUsdView = () => (
    <View style={[preset.flexDirectionRow, preset.justifyContentCenter, preset.alignItemsCenter, preset.marginSmall]}>
        <DaiCard />
        <Text style={[preset.fontSize32, preset.colorGrey, preset.marginSmall]}>=</Text>
        <UsdCard />
    </View>
);

const DaiCard = () => {
    return (
        <Card style={{ flexWrap: "wrap" }}>
            <View
                style={[
                    preset.flexDirectionRow,
                    preset.justifyContentCenter,
                    preset.alignItemsCenter,
                    { width: 56, height: 56, borderRadius: 24 }
                ]}>
                <Text style={[preset.fontSize24, preset.fontWeightBold, { color: "#fdb034" }]}>1</Text>
                <Text style={[preset.fontSize14, preset.fontWeightBold, { color: "#fdb034" }]}>DAI</Text>
            </View>
        </Card>
    );
};

const UsdCard = () => {
    return (
        <Card style={{ flexWrap: "wrap" }}>
            <View
                style={[
                    preset.flexDirectionRow,
                    preset.justifyContentCenter,
                    preset.alignItemsCenter,
                    { width: 56, height: 56, borderRadius: 24 }
                ]}>
                <Text style={[preset.fontSize20, preset.colorSuccess, preset.fontWeightBold]}>$</Text>
                <Text style={[preset.fontSize24, preset.colorSuccess, preset.fontWeightBold]}>1</Text>
            </View>
        </Card>
    );
};

export default DaiUsdView;

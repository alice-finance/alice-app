import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";

import { Linking } from "expo";
import { Button, Text } from "native-base";
import preset from "../styles/preset";
import CaptionText from "./CaptionText";
import TitleText from "./TitleText";

const AliceIFOView = () => {
    const { t } = useTranslation("finance");
    const onPress = useCallback(() => Linking.openURL(t("aliceIFO.blogUrl")), []);
    return (
        <View style={preset.marginBottomSmall}>
            <TitleText aboveText={true}>{t("aliceIFO")}</TitleText>
            <View style={[preset.flexDirectionRow, preset.flex1, preset.marginNormal]}>
                <Image
                    fadeDuration={0}
                    source={require("../assets/icon.png")}
                    style={[{ width: 96, height: 96 }, preset.marginLeftSmall]}
                    resizeMode="contain"
                />
                <View style={preset.flex1}>
                    <CaptionText>{t("aliceIFO.description")}</CaptionText>
                    <Button
                        primary={true}
                        rounded={true}
                        transparent={true}
                        onPress={onPress}
                        style={preset.alignFlexEnd}>
                        <Text style={preset.marginRightSmall}>{t("aliceIFO.more")}</Text>
                    </Button>
                </View>
            </View>
        </View>
    );
};

export default AliceIFOView;

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Button, Text } from "native-base";
import CaptionText from "../components/CaptionText";
import SubtitleText from "../components/SubtitleText";
import TitleText from "../components/TitleText";
import { Spacing } from "../constants/dimension";
import { AssetContext } from "../contexts/AssetContext";
import { BalancesContext } from "../contexts/BalancesContext";
import preset from "../styles/preset";

const StartView = ({ showImage = false, showTitle = false, style = {} }) => {
    const { navigate } = useNavigation();
    const { t } = useTranslation(["finance"]);
    const [showStart, setShowStart] = useState(false);
    const { assets } = useContext(AssetContext);
    const { getBalance } = useContext(BalancesContext);

    const asset = assets.find(value => value.ethereumAddress.isZero());
    const balance = asset && getBalance(asset.ethereumAddress);

    useEffect(() => {
        setShowStart(balance !== undefined && balance.isZero());
    }, [balance]);

    const onStartButtonPress = useCallback(() => {
        navigate("ExchangeTab");
    }, []);

    return showStart ? (
        <View style={[preset.marginBottomLarge, style]}>
            {showTitle && <TitleText aboveText={true}>{t("start")}</TitleText>}
            <SubtitleText style={startStyle.subtitle}>{t("start.depositAsset")}</SubtitleText>
            <CaptionText style={preset.marginBottomNormal}>{t("start.description")}</CaptionText>
            {showImage && (
                <View style={startStyle.horizontalMargin}>
                    <Image
                        fadeDuration={0}
                        source={require("../assets/alice.jpg")}
                        style={startStyle.image}
                        resizeMode="contain"
                    />
                </View>
            )}
            <View style={startStyle.rightContainer}>
                <Button
                    primary={true}
                    bordered={true}
                    rounded={true}
                    onPress={onStartButtonPress}
                    style={startStyle.horizontalMargin}>
                    <Text style={startStyle.button}>{t("start.viewExchange")}</Text>
                </Button>
            </View>
        </View>
    ) : null;
};

const startStyle = StyleSheet.create({
    image: {
        width: "100%",
        height: 200,
        alignSelf: "center"
    },
    rightContainer: { flex: 1, flexDirection: "row", justifyContent: "flex-end", marginBottom: Spacing.small },
    horizontalMargin: { marginHorizontal: Spacing.small + Spacing.normal },
    subtitle: { fontSize: 18 },
    button: { fontSize: 16 }
});

export default StartView;

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";

import { Updates } from "expo";
import { Button, Header, Text } from "native-base";
import CaptionText from "../components/texts/CaptionText";
import SubtitleText from "../components/texts/SubtitleText";
import { Spacing } from "../constants/dimension";
import preset from "../styles/preset";

const NotConnectedScreen = () => {
    const { t } = useTranslation("not-connected");
    const onRestart = useCallback(Updates.reload, []);
    return (
        <View>
            <Header transparent={true} />
            <SubtitleText aboveText={true}>{t("title")}</SubtitleText>
            <CaptionText style={preset.marginBottomLarge}>{t("description")}</CaptionText>
            <View style={preset.marginNormal}>
                <Image
                    source={require("../assets/not-connected.jpg")}
                    fadeDuration={0}
                    style={{ width: 204, height: 250, margin: Spacing.large, alignSelf: "center" }}
                />
                <Button
                    primary={true}
                    block={true}
                    rounded={true}
                    style={{ marginTop: Spacing.normal }}
                    onPress={onRestart}>
                    <Text>{t("restart")}</Text>
                </Button>
            </View>
        </View>
    );
};

export default NotConnectedScreen;

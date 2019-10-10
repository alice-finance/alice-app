import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";

import { Updates } from "expo";
import { Button, Container, Content, Text } from "native-base";
import CaptionText from "../../components/texts/CaptionText";
import SubtitleText from "../../components/texts/SubtitleText";
import preset from "../../styles/preset";

const CompleteScreen = () => {
    const { t } = useTranslation(["common", "start"]);
    const onComplete = useCallback(() => {
        Updates.reload();
    }, []);
    return (
        <Container style={preset.flex1}>
            <Content>
                <SubtitleText aboveText={true}>{t("start:complete")}</SubtitleText>
                <CaptionText>{t("start:complete.description")}</CaptionText>
                <View style={[preset.flex1, preset.marginNormal]}>
                    <Image
                        source={require("../../assets/rabbit.jpg")}
                        fadeDuration={0}
                        style={[{ width: 237, height: 333 }, preset.marginLarge, preset.alignCenter]}
                    />
                    <Button
                        info={true}
                        block={true}
                        rounded={true}
                        large={true}
                        style={preset.marginTopNormal}
                        onPress={onComplete}>
                        <Text>{t("start")}</Text>
                    </Button>
                </View>
            </Content>
        </Container>
    );
};

export default CompleteScreen;

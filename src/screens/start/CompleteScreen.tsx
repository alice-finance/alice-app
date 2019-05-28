import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";

import { Updates } from "expo";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import SubtitleText from "../../components/SubtitleText";
import { Spacing } from "../../constants/dimension";

const CompleteScreen = () => {
    const { t } = useTranslation(["common", "start"]);
    const onComplete = useCallback(() => {
        Updates.reload();
    }, []);
    return (
        <Container style={{ flex: 1 }}>
            <SubtitleText aboveText={true}>{t("start:complete")}</SubtitleText>
            <CaptionText>{t("start:complete.description")}</CaptionText>
            <View style={{ flex: 1, margin: Spacing.normal }}>
                <Image
                    source={require("../../assets/rabbit.jpg")}
                    fadeDuration={0}
                    style={{
                        width: 237,
                        height: 333,
                        margin: Spacing.large,
                        alignSelf: "center"
                    }}
                />
                <Button
                    success={true}
                    block={true}
                    large={true}
                    style={{ marginTop: Spacing.normal }}
                    onPress={onComplete}>
                    <Text>{t("start")}</Text>
                </Button>
            </View>
        </Container>
    );
};

export default CompleteScreen;

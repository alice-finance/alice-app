import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Colors } from "react-native-paper";

import { Linking } from "expo";
import { Button, Card, CardItem, Text } from "native-base";
import { Spacing } from "../constants/dimension";
import preset from "../styles/preset";
import TitleText from "./TitleText";

const ClosingView = () => {
    const { t } = useTranslation("closing");
    const openLink = () => {
        // TODO: Change this to real blog post
        Linking.openURL("https://google.com");
    };
    return (
        <View style={[preset.marginNormal]}>
            <Card>
                <CardItem
                    style={{
                        backgroundColor: Colors.red100,
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }}>
                    <TitleText
                        style={{
                            marginHorizontal: Spacing.small,
                            marginTop: Spacing.small,
                            marginBottom: Spacing.small
                        }}>
                        {t("title")}
                    </TitleText>
                    <Text style={{ margin: Spacing.small }}>{t("description")}</Text>
                    <View style={{ alignSelf: "flex-end", margin: Spacing.small, marginRight: 0 }}>
                        <Button rounded={true} onPress={openLink}>
                            <Text>{t("button")}</Text>
                        </Button>
                    </View>
                </CardItem>
            </Card>
        </View>
    );
};

export default ClosingView;

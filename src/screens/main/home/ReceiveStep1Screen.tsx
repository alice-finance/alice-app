import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Body, Card, CardItem, Container, Content, Icon, ListItem, Text } from "native-base";
import CaptionText from "../../../components/texts/CaptionText";
import HeadlineText from "../../../components/texts/HeadlineText";
import SubtitleText from "../../../components/texts/SubtitleText";
import { AssetContext } from "../../../contexts/AssetContext";
import preset from "../../../styles/preset";

const ReceiveStep1Screen = () => {
    const { t } = useTranslation(["home", "common"]);
    // const { assets } = useContext(AssetContext);
    const { push } = useNavigation();
    const onPress = useCallback(asset => push("ReceiveStep2", { asset }), []);
    return (
        <Container>
            <Content>
                <SubtitleText style={{ zIndex: 100 }}>{t("receive")}</SubtitleText>
                <DaiCard />
                <View style={preset.marginNormal}>
                    <CaptionText style={[preset.marginBottomNormal, preset.marginTopNormal]}>
                        {t("receive.step1")}
                    </CaptionText>
                    <TokenItem
                        text={t("receive.step1.tokens.ethereum")}
                        iconSource={require("../../../assets/eth-logo.png")}
                        onPress={onPress}
                    />
                    <TokenItem
                        text={t("receive.step1.tokens.dai")}
                        iconSource={require("../../../assets/dai-logo.png")}
                        onPress={onPress}
                    />
                </View>
            </Content>
        </Container>
    );
};

const DaiCard = () => {
    const { t } = useTranslation(["home"]);
    const { getAssetBySymbol } = useContext(AssetContext);
    const dai = getAssetBySymbol("DAI")!;
    return (
        <View style={preset.marginNormal}>
            <Card>
                <CardItem>
                    <Body style={preset.marginNormal}>
                        <Text style={[preset.fontSize20, preset.fontWeightBold]}>{t("receive.dai.title")}</Text>
                    </Body>
                </CardItem>
                <CardItem>
                    <Body style={preset.marginNormal}>
                        <Image
                            source={require("../../../assets/dai-logo.png")}
                            fadeDuration={0}
                            style={[{ width: 96, height: 96 }, preset.alignCenter]}
                        />
                        <HeadlineText style={[preset.alignCenter, preset.marginTopNormal]}>{dai.name}</HeadlineText>
                        <Text style={[preset.fontSize20, preset.fontWeightBold]} />
                        <Text style={[preset.fontSize16, preset.colorGrey, preset.alignCenter]}>
                            {t("receive.dai.description")}
                        </Text>
                    </Body>
                </CardItem>
            </Card>
        </View>
    );
};

const TokenItem = ({ iconSource, text, onPress }) => {
    return (
        <ListItem onPress={onPress}>
            <View style={[preset.flexDirectionRow, preset.marginNormal, preset.justifyContentCenter]}>
                <Image source={iconSource} fadeDuration={0} style={[{ width: 24, height: 24 }]} />
                <Text style={[preset.flex1, preset.marginLeftNormal, preset.fontSize20, preset.colorGrey]}>{text}</Text>
                <Icon type={"MaterialIcons"} name={"chevron-right"} style={preset.colorPrimary} />
            </View>
        </ListItem>
    );
};

export default ReceiveStep1Screen;

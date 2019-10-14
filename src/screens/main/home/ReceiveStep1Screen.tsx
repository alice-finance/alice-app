import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Image, ImageSourcePropType, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Address } from "@alice-finance/alice.js/dist";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { Body, Card, CardItem, Container, Content, Icon, ListItem, Text } from "native-base";
import CaptionText from "../../../components/texts/CaptionText";
import HeadlineText from "../../../components/texts/HeadlineText";
import NoteText from "../../../components/texts/NoteText";
import SubtitleText from "../../../components/texts/SubtitleText";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import preset from "../../../styles/preset";

const ReceiveStep1Screen = () => {
    const { t } = useTranslation(["home", "common"]);
    return (
        <Container>
            <Content>
                <SubtitleText>{t("receive")}</SubtitleText>
                <DaiCard />
                <View style={preset.marginNormal}>
                    <TokensSection />
                    <FeeSection />
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
                    <Body style={[preset.marginTopNormal, preset.marginLeftNormal]}>
                        <Text style={[preset.fontSize20, preset.fontWeightBold]}>{t("receive.aboutDai.title")}</Text>
                    </Body>
                </CardItem>
                <CardItem>
                    <Body style={[preset.marginNormal, preset.alignItemsCenter]}>
                        <View style={[preset.flexDirectionRow]}>
                            <Image
                                source={require("../../../assets/dai-logo.png")}
                                fadeDuration={0}
                                style={[{ width: 48, height: 48 }, preset.alignCenter]}
                            />
                            <HeadlineText style={[preset.alignCenter, preset.marginTopNormal]}>{dai.name}</HeadlineText>
                        </View>
                        <Text style={[preset.fontSize16, preset.colorGrey, preset.alignCenter, preset.marginTopNormal]}>
                            {t("receive.aboutDai.description")}
                        </Text>
                    </Body>
                </CardItem>
            </Card>
        </View>
    );
};

const TokensSection = () => {
    const { t } = useTranslation(["home"]);
    const { push } = useNavigation();
    const { getAssetByAddress } = useContext(AssetContext);
    const { getBalance } = useContext(BalancesContext);
    const myEthBalance = getBalance(getAssetByAddress(Address.createEthereumAddress(ZERO_ADDRESS))!.ethereumAddress);
    return (
        <>
            <CaptionText small={true} style={[preset.marginBottomNormal, preset.marginTopNormal]}>
                {t("receive.step1")}
            </CaptionText>
            <TokenItem
                text={t("receive.step1.tokens.ethereum")}
                iconSource={require("../../../assets/eth-logo.png")}
                onPress={useCallback(() => push("ReceiveStep2", { assetName: "ethereum" }), [])}
            />
            <TokenItem
                text={t("receive.step1.tokens.dai")}
                note={myEthBalance.isZero() ? t("receive.step1.tokens.dai.warning") : ""}
                iconSource={require("../../../assets/dai-logo.png")}
                onPress={useCallback(() => push("ReceiveStep2", { assetName: "dai" }), [])}
            />
        </>
    );
};

const FeeSection = () => {
    const { t } = useTranslation(["home"]);
    const { push } = useNavigation();
    const onPress = useCallback(() => push("ReceiveStep2", { assetName: "fee" }), []);
    return (
        <>
            <CaptionText style={[preset.marginBottomNormal, preset.marginTopLarge]}>
                {t("receive.step1.fee")}
            </CaptionText>
            <TokenItem text={t("receive.step1.tokens.fee")} onPress={onPress} />
        </>
    );
};

const TokenItem = ({ iconSource = null as ImageSourcePropType | null, text, note = "", onPress }) => {
    return (
        <ListItem onPress={onPress}>
            <View style={[preset.flexDirectionRow, preset.marginNormal, preset.justifyContentCenter]}>
                {iconSource ? (
                    <Image source={iconSource} fadeDuration={0} style={[{ width: 24, height: 24 }]} />
                ) : (
                    <Icon type={"MaterialCommunityIcons"} name={"coins"} style={preset.colorDark} />
                )}
                <View style={[preset.flex1, preset.marginLeftNormal]}>
                    <Text style={[preset.fontSize20]}>{text}</Text>
                    {note.length > 0 && (
                        <NoteText style={[preset.colorDanger, preset.marginTopSmall, preset.marginLeftSmall]}>
                            {note}
                        </NoteText>
                    )}
                </View>
                <Icon type={"MaterialIcons"} name={"chevron-right"} style={preset.colorPrimary} />
            </View>
        </ListItem>
    );
};

export default ReceiveStep1Screen;

import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import LoadingDots from "react-native-loading-dots";
import { Dialog, Portal } from "react-native-paper";

import { Body, Button, Card, CardItem, Container, Content, Icon, Text } from "native-base";
import CaptionText from "../../../components/texts/CaptionText";
import NoteText from "../../../components/texts/NoteText";
import SubtitleText from "../../../components/texts/SubtitleText";
import { ChainContext } from "../../../contexts/ChainContext";
import preset from "../../../styles/preset";

const ReceiveStep2Screen = () => {
    const { t } = useTranslation(["home", "common"]);
    const { ethereumChain } = useContext(ChainContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const address = ethereumChain!.getAddress().toLocalAddressString();
    const onOk = useCallback(() => {
        setDialogOpen(false);
        setWaiting(true);
    }, []);
    return (
        <Container>
            <Content>
                <SubtitleText style={{ zIndex: 100 }}>{t("receive")}</SubtitleText>
                <CaptionText style={[preset.marginBottomNormal, { zIndex: 100 }]}>{t("receive.step2")}</CaptionText>
                <AddressCard address={address} />
                <CopyButton openDialog={useCallback(() => setDialogOpen(true), [])} />
                {waiting && <WaitingSection />}
            </Content>
            <AddressCopiedDialog visible={dialogOpen} onOk={onOk} />
        </Container>
    );
};

const AddressCard = ({ address }) => {
    const { t } = useTranslation(["profile"]);
    return (
        <View style={preset.marginNormal}>
            <Card>
                <CardItem>
                    <Body style={preset.marginNormal}>
                        <Text style={[preset.fontSize20, preset.fontWeightBold]}>{t("myAddress")}</Text>
                        <Text style={[preset.colorDarkGrey, preset.marginTopNormal]}>{address}</Text>
                    </Body>
                </CardItem>
            </Card>
        </View>
    );
};

const CopyButton = ({ openDialog }) => {
    const { t } = useTranslation(["profile", "common"]);
    const onOk = useCallback(() => {
        openDialog();
    }, []);
    return (
        <Button
            primary={true}
            rounded={true}
            block={true}
            large={true}
            onPress={onOk}
            style={[preset.marginNormal, preset.marginTopSmall]}>
            <Text>{t("common:copy")}</Text>
        </Button>
    );
};

const WaitingSection = () => {
    const { t } = useTranslation(["home", "common"]);
    return (
        <View style={preset.marginLarge}>
            <Text style={[preset.fontSize24, preset.fontWeightBold]}>{t("receive.waiting")}</Text>
            <LoadingDots size={10} />
            <NoteText>{t("receive.waiting.description")}</NoteText>
        </View>
    );
};

const AddressCopiedDialog = ({ visible, onOk }) => {
    const { t } = useTranslation(["home", "common"]);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onOk}>
                <Dialog.Content>
                    <View style={[preset.marginNormal, preset.alignItemsCenter]}>
                        <Icon
                            type={"AntDesign"}
                            name={"checkcircleo"}
                            style={[preset.colorSuccess, { fontSize: 72 }]}
                        />
                        <Text
                            style={[
                                preset.alignCenter,
                                preset.fontSize36,
                                preset.fontWeightBold,
                                preset.marginTopSmall
                            ]}>
                            {t("receive.addressCopied")}
                        </Text>
                        <Text style={preset.marginTopNormal}>{t("receive.addressCopied.description")}</Text>
                    </View>
                </Dialog.Content>
                <Button primary={true} rounded={true} block={true} onPress={onOk} style={preset.marginNormal}>
                    <Text>{t("common:ok")}</Text>
                </Button>
            </Dialog>
        </Portal>
    );
};

export default ReceiveStep2Screen;

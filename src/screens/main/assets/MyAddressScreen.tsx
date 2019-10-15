import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, View } from "react-native";
import QRCode from "react-native-qrcode";

import { Button, Container, Text } from "native-base";
import CaptionText from "../../../components/texts/CaptionText";
import HeadlineText from "../../../components/texts/HeadlineText";
import { Spacing } from "../../../constants/dimension";
import { ChainContext } from "../../../contexts/ChainContext";
import preset from "../../../styles/preset";
import SnackBar from "../../../utils/SnackBar";

const MyAddressScreen = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { ethereumChain } = useContext(ChainContext);
    const address = ethereumChain!.getAddress().toLocalAddressString();
    const onOk = useCallback(() => {
        Clipboard.setString(address);
        SnackBar.success(t("addressCopiedToTheClipboard"));
    }, []);
    return (
        <Container>
            <HeadlineText style={{ zIndex: 100 }}>{t("myAddress")}</HeadlineText>
            <CaptionText small={true} style={{ zIndex: 100 }}>
                {t("myAddress.description")}
            </CaptionText>
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    margin: Spacing.normal,
                    zIndex: 0
                }}>
                <QRCode value={address} bgColor="black" fgColor="white" size={200} />
            </View>
            <Text style={[preset.textAlignCenter, preset.marginNormal, preset.colorDarkGrey]}>{address}</Text>
            <Button rounded={true} transparent={true} full={true} onPress={onOk}>
                <Text style={preset.colorInfo}>{t("common:copy")}</Text>
            </Button>
        </Container>
    );
};

export default MyAddressScreen;

import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, FlatList, View } from "react-native";
import QRCode from "react-native-qrcode";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Button, Container, Content, Text } from "native-base";
import AssetListItem from "../../../components/AssetListItem";
import CaptionText from "../../../components/texts/CaptionText";
import SubtitleText from "../../../components/texts/SubtitleText";
import { Spacing } from "../../../constants/dimension";
import { AssetContext } from "../../../contexts/AssetContext";
import { ChainContext } from "../../../contexts/ChainContext";
import preset from "../../../styles/preset";
import SnackBar from "../../../utils/SnackBar";

const ReceiveScreen = () => {
    const { t } = useTranslation(["home", "common"]);
    const [asset, setAsset] = useState<ERC20Asset | null>(null);
    return (
        <Container>
            <Content>
                <SubtitleText style={{ zIndex: 100 }}>{t("receive")}</SubtitleText>
                {asset ? <Step2 /> : <Step1 onSelectAsset={setAsset} />}
            </Content>
        </Container>
    );
};

const Step1 = ({ onSelectAsset }) => {
    const { t } = useTranslation("home");
    const { assets } = useContext(AssetContext);
    const renderItem = useCallback(({ item }) => <AssetListItem asset={item} onPress={onSelectAsset} />, []);
    return (
        <>
            <CaptionText style={[preset.marginBottomNormal, { zIndex: 100 }]}>{t("receive.step1")}</CaptionText>
            <View style={preset.marginNormal}>
                <FlatList data={assets} keyExtractor={defaultKeyExtractor} renderItem={renderItem} />
            </View>
        </>
    );
};

const Step2 = () => {
    const { t } = useTranslation("home");
    const { ethereumChain } = useContext(ChainContext);
    const address = ethereumChain!.getAddress().toLocalAddressString();
    return (
        <>
            <CaptionText style={[preset.marginBottomNormal, { zIndex: 100 }]}>{t("receive.step2")}</CaptionText>
            <AddressView address={address} />
        </>
    );
};

const AddressView = ({ address }) => {
    return (
        <View>
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
            <CopyButton address={address} />
        </View>
    );
};

const CopyButton = ({ address }) => {
    const { t } = useTranslation(["profile", "common"]);
    const onOk = useCallback(() => {
        Clipboard.setString(address);
        SnackBar.success(t("addressCopiedToTheClipboard"));
    }, []);
    return (
        <Button rounded={true} transparent={true} full={true} onPress={onOk}>
            <Text style={preset.colorInfo}>{t("common:copy")}</Text>
        </Button>
    );
};

export default ReceiveScreen;

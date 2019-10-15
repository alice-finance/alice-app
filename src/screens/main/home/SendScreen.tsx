import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { BigNumber } from "ethers/utils";
import { Button, Container, Content, Text } from "native-base";
import AssetListItem from "../../../components/AssetListItem";
import AmountInput from "../../../components/inputs/AmountInput";
import BigNumberText from "../../../components/texts/BigNumberText";
import CaptionText from "../../../components/texts/CaptionText";
import SubtitleText from "../../../components/texts/SubtitleText";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import preset from "../../../styles/preset";

const SendScreen = () => {
    const { t } = useTranslation(["home", "common"]);
    const [asset, setAsset] = useState<ERC20Asset | null>(null);
    const [amount, setAmount] = useState<BigNumber | null>(null);
    const onSelectAsset = useCallback(item => setAsset(item), []);
    const onSend = useCallback(() => {}, []);
    return (
        <Container>
            <Content>
                <SubtitleText style={{ zIndex: 100 }}>{t("receive")}</SubtitleText>
                {asset ? (
                    <Step2 asset={asset} onChangeAmount={setAmount} buttonDisabled={!amount} onPressButton={onSend} />
                ) : (
                    <Step1 onSelectAsset={onSelectAsset} />
                )}
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

const Step2 = ({ asset, onChangeAmount, buttonDisabled, onPressButton }) => {
    const { t } = useTranslation("home");
    const { getBalance } = useContext(BalancesContext);
    return (
        <>
            <AmountInput asset={asset} onChangeAmount={onChangeAmount} />
            <View style={[preset.flex1, preset.flexDirectionColumn]}>
                <Text style={preset.fontSize14}>{t("myBalance")}</Text>
                <View style={[preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <BigNumberText
                        value={getBalance(asset.loomAddress)}
                        suffix={asset!.symbol}
                        decimalPlaces={4}
                        style={[preset.flex1, preset.fontSize24]}
                    />
                </View>
            </View>
            <Button
                primary={true}
                rounded={true}
                bordered={true}
                block={true}
                style={preset.marginTopNormal}
                disabled={buttonDisabled}
                onPress={onPressButton}>
                <Text>{t("send")}</Text>
            </Button>
        </>
    );
};

export default SendScreen;

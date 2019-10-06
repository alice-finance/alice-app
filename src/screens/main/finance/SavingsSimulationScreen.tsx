import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Body, Card, CardItem, Container, Content, Left, Right, Text } from "native-base";
import AmountInput from "../../../components/AmountInput";
import BigNumberText from "../../../components/BigNumberText";
import CaptionText from "../../../components/CaptionText";
import NoteText from "../../../components/NoteText";
import Spinner from "../../../components/Spinner";
import StartSavingButton from "../../../components/StartSavingsButton";
import TitleText from "../../../components/TitleText";
import TokenIcon from "../../../components/TokenIcon";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const SavingsSimulationScreen = () => {
    const { t } = useTranslation("finance");
    const { asset } = useContext(SavingsContext);
    const { loomChain } = useContext(ChainContext);
    const [amount, setAmount] = useState<BigNumber | null>(null);
    const [apr, setAPR] = useState<BigNumber | null>(toBigNumber(0));
    const [loading, setLoading] = useState(false);
    const aprText = formatValue(toBigNumber(apr).mul(100), asset!.decimals, 2) + " %";
    useAsyncEffect(async () => {
        if (amount) {
            setLoading(true);
            const market = loomChain!.getMoneyMarket();
            setAPR(await market.getExpectedSavingsAPR(amount));
            setLoading(false);
        }
    }, [amount]);
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("simulation")}</TitleText>
                <CaptionText style={preset.marginBottomNormal}>{t("simulation.description")}</CaptionText>
                <Controls asset={asset} setAmount={setAmount} aprText={aprText} />
                <Result apr={apr} amount={amount} loading={loading} />
            </Content>
        </Container>
    );
};

const Controls = ({ asset, setAmount, aprText }) => {
    const { t } = useTranslation("finance");
    return (
        <View style={[preset.marginLeftLarge, preset.marginRightLarge, preset.marginTopLarge]}>
            <View style={[preset.flexDirectionRow, preset.alignItemsCenter]}>
                <Text style={preset.fontSize24}>{t("amount")}</Text>
                <AmountInput
                    asset={asset!}
                    placeholderHidden={true}
                    onChangeAmount={setAmount}
                    style={[preset.flex1, preset.marginLeftNormal, preset.marginRightSmall]}
                />
                <Text style={[preset.fontSize24, preset.colorDarkGrey]}>{asset!.symbol}</Text>
            </View>
            <View style={[preset.flexDirectionRow, preset.alignItemsCenter, preset.marginTopSmall]}>
                <Text style={preset.fontSize24}>{t("apr")}</Text>
                <Text style={[preset.flex1, preset.marginRightSmall, preset.fontSize32, preset.textAlignRight]}>
                    {aprText}
                </Text>
            </View>
        </View>
    );
};

const Header = ({ asset }) => {
    const { t } = useTranslation("finance");
    return (
        <CardItem>
            <Left>
                <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={32} height={32} />
                <Body style={preset.marginLeftNormal}>
                    <Text style={[preset.fontSize20, preset.colorGrey]}>{asset!.name}</Text>
                </Body>
            </Left>
            <Right>
                <NoteText style={preset.textAlignRight}>{t("afterOneYear")}</NoteText>
            </Right>
        </CardItem>
    );
};

const Main = ({ asset, decimals, apr, amount }) => {
    const { t } = useTranslation("finance");
    const assetSuffix = " " + asset!.symbol;
    const profit = amount.mul(apr).div(toBigNumber(10).pow(decimals));
    const amountToClaim = amount.mul(365);
    return (
        <CardItem>
            <View style={preset.flexDirectionRow}>
                <View style={[preset.flex1, preset.alignItemsFlexEnd]}>
                    <Text style={preset.fontSize20}>{t("expectedBalance")}</Text>
                    <Text style={preset.fontSize20}>{t("expectedInterest")}</Text>
                    <Text style={preset.fontSize20}>{t("expectedRewards")}</Text>
                </View>
                <View style={[preset.flex2, preset.alignItemsCenter]}>
                    <BigNumberText value={amount.add(profit)} suffix={assetSuffix} style={preset.fontWeightBold} />
                    <BigNumberText value={profit} suffix={assetSuffix} style={preset.fontWeightBold} />
                    <BigNumberText value={amountToClaim} suffix={" ALICE"} style={preset.fontWeightBold} />
                </View>
            </View>
        </CardItem>
    );
};

const Result = ({ apr, amount, loading }) => {
    const { t } = useTranslation("finance");
    const { asset, decimals } = useContext(SavingsContext);
    return (
        amount &&
        (loading ? (
            <Spinner compact={true} label={t("loading")} />
        ) : (
            <View style={[preset.marginNormal, preset.marginTopLarge]}>
                <ExpectationCard asset={asset} decimals={decimals} apr={apr} amount={amount} />
            </View>
        ))
    );
};

const ExpectationCard = ({ asset, decimals, apr, amount }) => {
    return (
        <Card>
            <Header asset={asset} />
            <Main asset={asset} decimals={decimals} apr={apr} amount={amount} />
            <CardItem>
                <StartSavingButton />
            </CardItem>
        </Card>
    );
};

export default SavingsSimulationScreen;

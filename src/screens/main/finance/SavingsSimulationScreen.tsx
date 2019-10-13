import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Body, Card, CardItem, Container, Content, Left, Right, Text } from "native-base";
import StartSavingsButton from "../../../components/buttons/StartSavingsButton";
import DaiUsdView from "../../../components/DaiUsdView";
import SavingsAmountInput from "../../../components/inputs/SavingsAmountInput";
import Spinner from "../../../components/Spinner";
import BigNumberText from "../../../components/texts/BigNumberText";
import CaptionText from "../../../components/texts/CaptionText";
import NoteText from "../../../components/texts/NoteText";
import TitleText from "../../../components/texts/TitleText";
import TokenIcon from "../../../components/TokenIcon";
import { SavingsContext } from "../../../contexts/SavingsContext";
import preset from "../../../styles/preset";

const SavingsSimulationScreen = () => {
    const { t } = useTranslation("savings");
    const [amount, setAmount] = useState<BigNumber | null>(null);
    const [apr, setAPR] = useState<BigNumber | null>(toBigNumber(0));
    const [loading, setLoading] = useState(false);
    const onLoadingStarted = () => setLoading(true);
    const onLoadingFinished = () => setLoading(false);
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("simulation")}</TitleText>
                <CaptionText style={preset.marginBottomNormal}>{t("simulation.description")}</CaptionText>
                <View style={[preset.marginLarge]}>
                    <DaiUsdView />
                    <SavingsAmountInput
                        onAmountChanged={setAmount}
                        onAPRChanged={setAPR}
                        onLoadingStarted={onLoadingStarted}
                        onLoadingFinished={onLoadingFinished}
                    />
                </View>
                <Result apr={apr} amount={amount} loading={loading} />
            </Content>
        </Container>
    );
};

const Header = ({ asset }) => {
    const { t } = useTranslation("savings");
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
    const { t } = useTranslation("savings");
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
    const { t } = useTranslation(["savings", "common"]);
    const { asset, decimals } = useContext(SavingsContext);
    return amount ? (
        loading ? (
            <Spinner compact={true} label={t("common:loading")} />
        ) : (
            <View style={[preset.marginNormal, preset.marginTopLarge]}>
                <ExpectationCard asset={asset} decimals={decimals} apr={apr} amount={amount} />
            </View>
        )
    ) : (
        <CaptionText style={preset.marginNormal}>{t("simulation.input")}</CaptionText>
    );
};

const ExpectationCard = ({ asset, decimals, apr, amount }) => {
    return (
        <Card>
            <Header asset={asset} />
            <Main asset={asset} decimals={decimals} apr={apr} amount={amount} />
            <CardItem>
                <StartSavingsButton apr={apr} />
            </CardItem>
        </Card>
    );
};

export default SavingsSimulationScreen;

import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Button, Card, CardItem, Container, Content, Text } from "native-base";
import SavingsAmountInput from "../../../components/inputs/SavingsAmountInput";
import Spinner from "../../../components/Spinner";
import BigNumberText from "../../../components/texts/BigNumberText";
import CaptionText from "../../../components/texts/CaptionText";
import TitleText from "../../../components/texts/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useSavingsStarter from "../../../hooks/useSavingsStarter";
import preset from "../../../styles/preset";

const NewSavingsScreen = () => {
    const { t } = useTranslation(["savings", "common"]);
    const { loomChain } = useContext(ChainContext);
    const { asset } = useContext(SavingsContext);
    const { updateBalance } = useContext(BalancesContext);
    const [amount, setAmount] = useState<BigNumber | null>(null);
    useAsyncEffect(async () => {
        updateBalance(asset!.loomAddress, toBigNumber(await loomChain!.balanceOfERC20Async(asset!)));
    }, []);
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("startSaving")}</TitleText>
                <CaptionText>{t("startSaving.description")}</CaptionText>
                <MyBalanceCard setAmount={setAmount} />
                <Main asset={asset} amount={amount} setAmount={setAmount} />
            </Content>
        </Container>
    );
};

const Main = ({ asset, amount, setAmount }) => {
    const { t } = useTranslation(["savings", "common"]);
    const { navigate } = useNavigation();
    const [loading, setLoading] = useState(false);
    const { starting, start } = useSavingsStarter(asset, amount);
    const onPressStart = useCallback(async () => {
        await start();
        navigate("HomeTab");
    }, [start]);
    return (
        <View style={[preset.marginLeftLarge, preset.marginRightLarge]}>
            <SavingsAmountInput
                onAmountChanged={setAmount}
                onLoadingStarted={useCallback(() => setLoading(true), [])}
                onLoadingFinished={useCallback(() => setLoading(false), [])}
            />
            {starting ? (
                <Spinner compact={true} label={t("starting")} />
            ) : (
                <StartButton onPress={onPressStart} disabled={!amount || amount.isZero() || loading} />
            )}
        </View>
    );
};

const MyBalanceCard = ({ setAmount }) => {
    const { t } = useTranslation("savings");
    const { asset } = useContext(SavingsContext);
    const { getBalance } = useContext(BalancesContext);
    const myBalance = getBalance(asset!.loomAddress);
    return (
        <View style={preset.marginNormal}>
            <Card>
                <CardItem>
                    <View style={[preset.flex1, preset.flexDirectionColumn, preset.marginSmall]}>
                        <Text style={preset.fontSize14}>{t("myBalance")}</Text>
                        <View style={[preset.flexDirectionRow, preset.alignItemsCenter]}>
                            <BigNumberText
                                value={myBalance}
                                suffix={asset!.symbol}
                                decimalPlaces={4}
                                style={[preset.flex1, preset.fontSize24]}
                            />
                            {/*<MaxButton onPress={useCallback(() => setAmount(myBalance), [myBalance])} />*/}
                        </View>
                    </View>
                </CardItem>
            </Card>
        </View>
    );
};

const StartButton = ({ onPress, disabled }) => {
    const { t } = useTranslation("common");
    return (
        <Button
            primary={true}
            rounded={true}
            block={true}
            style={preset.marginTopLarge}
            disabled={disabled}
            onPress={onPress}>
            <Text>{t("start")}</Text>
        </Button>
    );
};

const MaxButton = ({ onPress }) => {
    return (
        <Button rounded={true} transparent={true} full={true} style={preset.paddingTiny} onPress={onPress}>
            <Text style={[preset.colorInfo, preset.fontSize16]}>MAX</Text>
        </Button>
    );
};

export default NewSavingsScreen;

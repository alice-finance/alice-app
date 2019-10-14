import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Button, Card, CardItem, Container, Content, Text } from "native-base";
import StartSavingsButton from "../../../components/buttons/StartSavingsButton";
import DaiUsdView from "../../../components/DaiUsdView";
import SavingsAmountInput from "../../../components/inputs/SavingsAmountInput";
import Spinner from "../../../components/Spinner";
import BigNumberText from "../../../components/texts/BigNumberText";
import CaptionText from "../../../components/texts/CaptionText";
import TitleText from "../../../components/texts/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useSavingsStarter from "../../../hooks/useSavingsStarter";
import preset from "../../../styles/preset";

const NewSavingsScreen = () => {
    const { t } = useTranslation(["savings", "common"]);
    const { asset } = useContext(SavingsContext);
    const { getBalance } = useContext(BalancesContext);
    const [amount, setAmount] = useState<BigNumber>(toBigNumber(0));
    const myBalance = getBalance(asset!.loomAddress);
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("startSavings")}</TitleText>
                {myBalance.isZero() ? (
                    <>
                        <CaptionText>{t("startSavings.description.withoutDai")}</CaptionText>
                        <DaiUsdView />
                        <ReceiveDaiSection />
                    </>
                ) : (
                    <>
                        <CaptionText>{t("startSavings.description")}</CaptionText>
                        <MyBalanceCard />
                        <StartSavingsSection asset={asset} amount={amount} setAmount={setAmount} />
                    </>
                )}
            </Content>
        </Container>
    );
};

const ReceiveDaiSection = () => {
    const { t } = useTranslation(["home"]);
    const { push } = useNavigation();
    const onPress = useCallback(() => {
        push("ReceiveStep1");
    }, []);
    return (
        <View style={[preset.marginLarge]}>
            <Button primary={true} rounded={true} block={true} onPress={onPress}>
                <Text>{t("receive")}</Text>
            </Button>
        </View>
    );
};

const StartSavingsSection = ({ asset, amount, setAmount }) => {
    const { t } = useTranslation(["savings", "common"]);
    const { navigate } = useNavigation();
    const { getBalance } = useContext(BalancesContext);
    const [loading, setLoading] = useState(false);
    const { starting, start } = useSavingsStarter(asset, amount);
    const myBalance = getBalance(asset.loomAddress);
    const onPressStart = useCallback(async () => {
        await start();
        navigate("HomeTab");
    }, [start]);
    return (
        <View style={[preset.marginLarge]}>
            <SavingsAmountInput
                initialAmount={myBalance}
                onAmountChanged={setAmount}
                onLoadingStarted={useCallback(() => setLoading(true), [])}
                onLoadingFinished={useCallback(() => setLoading(false), [])}
            />
            {starting ? (
                <Spinner compact={true} label={t("starting")} />
            ) : (
                <StartSavingsButton
                    onPress={onPressStart}
                    disabled={amount.isZero() || amount.gt(myBalance) || loading}
                    style={preset.marginTopLarge}
                />
            )}
        </View>
    );
};

const MyBalanceCard = () => {
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
                        </View>
                    </View>
                </CardItem>
            </Card>
        </View>
    );
};

export default NewSavingsScreen;

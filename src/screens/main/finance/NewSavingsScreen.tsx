import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Button, Container, Content, Text } from "native-base";
import AmountInput from "../../../components/AmountInput";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import Row from "../../../components/Row";
import SavingRecordCard from "../../../components/SavingRecordCard";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TitleText from "../../../components/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useMySavingsUpdater from "../../../hooks/useMySavingsUpdater";
import useSavingsStarter from "../../../hooks/useSavingsStarter";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const NewSavingsScreen = () => {
    const { setParams, push } = useNavigation();
    const { t } = useTranslation(["finance", "common"]);
    const { loomChain } = useContext(ChainContext);
    const { totalBalance, myRecords, asset, decimals } = useContext(SavingsContext);
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [aprText, setAprText] = useState(t("loading"));
    const [loadingAPR, setLoadingAPR] = useState(false);
    const myBalance = getBalance(asset!.loomAddress);
    const myBalanceText = formatValue(myBalance, asset!.decimals) + " " + asset!.symbol;
    const { starting, start } = useSavingsStarter(asset, amount);
    const onPressManageAsset = useCallback(() => push("ManageAsset", { asset }), []);
    const {} = useContext(SavingsContext);
    const sortedMyRecords = myRecords
        ? myRecords.sort((a, b) => b.initialTimestamp.getTime() - a.initialTimestamp.getTime())
        : null;
    const renderItem = useCallback(({ item }) => <SavingRecordCard record={item} />, []);
    const { update } = useMySavingsUpdater();
    useEffect(() => {
        const refresh = async () => {
            const balance = await loomChain!.balanceOfERC20Async(asset!);
            updateBalance(asset!.loomAddress, toBigNumber(balance));
        };
        refresh();
    }, []);
    useEffect(() => {
        if (totalBalance) {
            update();
        }
    }, [totalBalance]);
    useEffect(() => {
        if (amount) {
            const load = async () => {
                setLoadingAPR(true);
                const market = loomChain!.getMoneyMarket();
                const expected = await market.getExpectedSavingsAPR(amount);
                setAprText(formatValue(toBigNumber(expected).mul(100), decimals, 2) + " %");
                setLoadingAPR(false);
            };
            load();
        }
    }, [amount]);
    const startSavings = useCallback(() => {
        start().then(() => {
            setAmount(toBigNumber(0));
        });
    }, [start, setAmount]);

    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("startSaving")}</TitleText>
                <CaptionText style={preset.marginBottomNormal}>{t("startSaving.description")}</CaptionText>
                <View style={[preset.marginLeftNormal, preset.marginRightNormal]}>
                    <AmountInput
                        asset={asset!}
                        max={myBalance}
                        disabled={myBalance.isZero() || starting}
                        style={[preset.marginLeftSmall, preset.marginRightSmall]}
                        onChangeAmount={setAmount}
                    />
                    <View style={[preset.marginLeftNormal, preset.marginTopNormal, preset.marginRightNormal]}>
                        <Row label={t("apr")} value={loadingAPR ? t("loading") : aprText} />
                        <Row label={t("myBalance")} value={myBalanceText} error={myBalance.isZero()} />
                    </View>
                    {starting ? (
                        <Spinner compact={true} label={t("starting")} />
                    ) : (
                        <>
                            <Button
                                primary={true}
                                rounded={true}
                                block={true}
                                style={preset.marginSmall}
                                disabled={!amount || amount.isZero() || loadingAPR}
                                onPress={startSavings}>
                                <Text>{t("common:start")}</Text>
                            </Button>
                            <Button
                                primary={true}
                                rounded={true}
                                block={true}
                                bordered={true}
                                iconRight={true}
                                style={preset.marginSmall}
                                onPress={onPressManageAsset}>
                                <Text>{t("manageAsset")}</Text>
                            </Button>
                        </>
                    )}
                </View>
                <SubtitleText aboveText={true} style={preset.marginTopNormal}>
                    {t("mySavings")}
                </SubtitleText>
                {myRecords ? (
                    <FlatList
                        data={sortedMyRecords}
                        keyExtractor={savingRecordKeyExtractor}
                        renderItem={renderItem}
                        ListEmptyComponent={<EmptyView text={t("noSavingsHistory")} />}
                    />
                ) : (
                    <Spinner compact={true} />
                )}
            </Content>
        </Container>
    );
};

const savingRecordKeyExtractor = (item: SavingsRecord) => item.id.toString();

export default NewSavingsScreen;

import * as React from "react";
import { useContext } from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
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
import LoanRecordCard from "../../../components/LoanRecordCard";
import Row from "../../../components/Row";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TitleText from "../../../components/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useSavingsStarter from "../../../hooks/useSavingsStarter";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const NewLoanScreen = collateral => {
    const { t } = useTranslation(["finance", "common"]);
    const { push } = useNavigation();
    const { loomChain } = useContext(ChainContext);
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const { asset, totalBalance, myRecords, decimals } = useContext(SavingsContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    // const myBalance = getBalance(asset!.loomAddress);
    const myBalance = toBigNumber(124);
    const [loadingAPR, setLoadingAPR] = useState(false);
    const { starting, start } = useSavingsStarter(asset, amount);
    const [aprText, setAprText] = useState(t("loading"));
    const myBalanceText = formatValue(myBalance, collateral!.decimals) + " " + collateral!.symbol;
    const myLoanText = formatValue(myBalance, asset!.decimals) + " " + asset!.symbol;
    const onPressManageAsset = useCallback(() => push("ManageAsset", { collateral }), []);
    const sortedMyRecords = myRecords
        ? myRecords.sort((a, b) => b.initialTimestamp.getTime() - a.initialTimestamp.getTime())
        : null;
    const renderItem = useCallback(
        ({ item }) => <LoanRecordCard record={item} asset={asset} collateral={collateral} />,
        []
    );
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
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("startBorrowing")}</TitleText>
                <CaptionText style={preset.marginBottomNormal}>{t("startBorrowing.description")}</CaptionText>
                <View style={[preset.marginLeftNormal, preset.marginRightNormal]}>
                    <AmountInput
                        asset={collateral!}
                        max={myBalance}
                        disabled={myBalance.isZero() || starting}
                        style={[preset.marginLeftSmall, preset.marginRightSmall]}
                        onChangeAmount={setAmount}
                    />
                    <View style={[preset.marginLeftNormal, preset.marginTopNormal, preset.marginRightNormal]}>
                        <Row label={t("apr")} value={loadingAPR ? t("loading") : aprText} />
                        <Row label={t("myBalance")} value={myBalanceText} error={myBalance.isZero()} />
                        <Row label={t("loanAmount")} value={myLoanText} error={myBalance.isZero()} />
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
                                onPress={start}>
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
                    {t("myLoans")}
                </SubtitleText>
                {myRecords ? (
                    <FlatList
                        data={sortedMyRecords}
                        keyExtractor={loanRecordKeyExtractor}
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

const loanRecordKeyExtractor = (item: SavingsRecord) => item.id.toString();

export default NewLoanScreen;

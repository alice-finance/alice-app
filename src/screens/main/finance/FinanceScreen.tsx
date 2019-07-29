import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Linking } from "expo";
import { Button, Container, Content, Icon } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import LoansCard from "../../../components/LoansCard";
import SavingRecordCard from "../../../components/SavingRecordCard";
import SavingsCard from "../../../components/SavingsCard";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TitleText from "../../../components/TitleText";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useMySavingsUpdater from "../../../hooks/useMySavingsUpdater";
import preset from "../../../styles/preset";
import AuthScreen from "../../AuthScreen";

const FinanceScreen = () => {
    const { setParams, push } = useNavigation();
    const { t } = useTranslation(["finance", "common"]);
    const { totalBalance, myRecords } = useContext(SavingsContext);
    const sortedMyRecords = myRecords
        ? myRecords.sort((a, b) => b.initialTimestamp.getTime() - a.initialTimestamp.getTime())
        : null;
    const onPress = useCallback(() => Linking.openURL(t("common:blogUrl")), []);
    const { update } = useMySavingsUpdater();
    const loans = [
        { asset: { name: "Kyber Network", symbol: "KNC", decimals: 18 } },
        { asset: { name: "0x", symbol: "ZRX", decimals: 18 } }
    ];
    useScheduledUpdater();
    useEffect(() => {
        setParams({ onPress });
        if (totalBalance) {
            update();
        }
    }, [totalBalance]);
    useEffect(() => {
        AuthScreen.getSavedPasscode().then(passcode => {
            if (!passcode || passcode === "") {
                push("Auth", { needsRegistration: true, firstTime: true });
            }
        });
    }, []);

    return (
        <Container>
            <Content>
                <View>
                    <TitleText>{t("common:finance")}</TitleText>
                    <CaptionText style={preset.marginBottomNormal}>{t("savings.description")}</CaptionText>
                    <SubtitleText>{t("savings")}</SubtitleText>
                    <SavingsCard />
                    <SubtitleText>{t("loan")}</SubtitleText>
                    {loans ? (
                        loans.length > 0 ? (
                            loans.map((loan, index) => <LoansCard key={index} collateral={loan.asset} />)
                        ) : (
                            <EmptyView />
                        )
                    ) : (
                        <Spinner compact={true} />
                    )}
                </View>
            </Content>
        </Container>
    );
};

const useScheduledUpdater = () => {
    const { loomChain } = useContext(ChainContext);
    const { totalBalance, setTotalBalance, apr, setAPR } = useContext(SavingsContext);
    useEffect(() => {
        const refresh = async () => {
            const market = loomChain!.getMoneyMarket();
            setTotalBalance(toBigNumber(await market.totalFunds()));
            setAPR(toBigNumber(await market.getCurrentSavingsAPR()).mul(toBigNumber(100)));
        };
        refresh();
        const handle = setInterval(() => refresh(), 60 * 1000);
        return () => clearInterval(handle);
    }, []);
    return { apr, totalSavings: totalBalance };
};

export default FinanceScreen;

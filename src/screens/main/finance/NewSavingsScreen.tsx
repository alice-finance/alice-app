import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text as NativeText, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { BigNumber } from "ethers/utils";
import { Button, Container, Icon, Text } from "native-base";
import AmountInput from "../../../components/AmountInput";
import CaptionText from "../../../components/CaptionText";
import Row from "../../../components/Row";
import Spinner from "../../../components/Spinner";
import TitleText from "../../../components/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useSavingsStarter from "../../../hooks/useSavingsStarter";
import preset from "../../../styles/preset";
import { formatValue, toBigNumber } from "../../../utils/big-number-utils";

const NewSavingsScreen = () => {
    const { push } = useNavigation();
    const { t } = useTranslation(["finance", "common"]);
    const { loomChain } = useContext(ChainContext);
    const { asset, decimals } = useContext(SavingsContext);
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [aprText, setAprText] = useState(t("loading"));
    const [loadingAPR, setLoadingAPR] = useState(false);
    const myBalance = getBalance(asset!.loomAddress);
    const myBalanceText = formatValue(myBalance, asset!.decimals, 2) + " " + asset!.symbol;
    const { starting, start } = useSavingsStarter(asset, amount);
    const onPressManageAsset = useCallback(() => push("ManageAsset", { asset }), []);
    useEffect(() => {
        const refresh = async () => {
            const balance = await loomChain!.balanceOfERC20Async(asset!);
            updateBalance(asset!.loomAddress, toBigNumber(balance));
        };
        refresh();
    }, []);
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
            <TitleText aboveText={true}>{t("startSaving")}</TitleText>
            <CaptionText style={preset.marginBottomNormal}>{t("startSaving.description")}</CaptionText>
            <View style={[preset.marginLeftNormal, preset.marginRightNormal]}>
                <AmountInput
                    asset={asset!}
                    max={myBalance}
                    disabled={starting}
                    style={[preset.marginLeftSmall, preset.marginRightSmall]}
                    onChangeAmount={setAmount}
                />
                <View style={[preset.marginLeftNormal, preset.marginTopNormal, preset.marginRightNormal]}>
                    <Row label={t("apr")} value={loadingAPR ? t("loading") : aprText} />
                    <Row label={t("myBalance")} value={myBalanceText} />
                </View>
                {starting ? (
                    <Spinner compact={true} label={t("starting")} />
                ) : (
                    <>
                        <Button
                            rounded={true}
                            transparent={true}
                            small={true}
                            iconRight={true}
                            onPress={onPressManageAsset}
                            style={preset.alignFlexEnd}>
                            <NativeText style={[preset.fontSize16, preset.colorPrimary]}>{t("manageAsset")}</NativeText>
                            <Icon type="MaterialCommunityIcons" name="chevron-right" style={preset.fontSize20} />
                        </Button>
                        <Button
                            primary={true}
                            rounded={true}
                            block={true}
                            style={preset.marginSmall}
                            disabled={!amount || amount.isZero() || loadingAPR}
                            onPress={start}>
                            <Text>{t("common:start")}</Text>
                        </Button>
                    </>
                )}
            </View>
        </Container>
    );
};

export default NewSavingsScreen;

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text as NativeText, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { BigNumber } from "ethers/utils";
import { Button, Container, Icon, Text } from "native-base";
import AmountInput from "../../../components/AmountInput";
import CaptionText from "../../../components/CaptionText";
import Spinner from "../../../components/Spinner";
import TitleText from "../../../components/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ConnectorContext } from "../../../contexts/ConnectorContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useSavingsStarter from "../../../hooks/useSavingsStarter";
import preset from "../../../styles/preset";
import { formatValue, toBigNumber } from "../../../utils/big-number-utils";

const NewSavingsScreen = () => {
    const { push } = useNavigation();
    const { t } = useTranslation(["finance", "common"]);
    const { loomConnector } = useContext(ConnectorContext);
    const { asset, decimals, apr } = useContext(SavingsContext);
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const aprText = apr ? formatValue(apr, decimals, 2) + " %" : t("loading");
    const myBalance = getBalance(asset!.loomAddress);
    const myBalanceText = formatValue(myBalance, asset!.decimals, 2) + " " + asset!.symbol;
    const { starting, start } = useSavingsStarter(asset, amount);
    const onPressManageAsset = useCallback(() => push("ManageAsset", { asset }), []);
    useEffect(() => {
        const refresh = async () => {
            if (loomConnector && asset) {
                const erc20 = loomConnector.getERC20(asset.loomAddress.toLocalAddressString());
                const balance = await erc20.balanceOf(loomConnector.address.toLocalAddressString());
                updateBalance(asset.loomAddress, toBigNumber(balance));
            }
        };
        refresh();
    }, [loomConnector, asset]);
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
                <View style={[preset.marginNormal]}>
                    <Row label={t("apr")} value={aprText} />
                    <Row label={t("myBalance")} value={myBalanceText} />
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
                            disabled={!amount || amount.isZero()}
                            onPress={start}>
                            <Text>{t("common:start")}</Text>
                        </Button>
                        <Button
                            rounded={true}
                            transparent={true}
                            small={true}
                            iconRight={true}
                            onPress={onPressManageAsset}
                            style={preset.alignFlexEnd}>
                            <NativeText style={[preset.fontSize14, preset.colorPrimary]}>{t("manageAsset")}</NativeText>
                            <Icon type="MaterialCommunityIcons" name="chevron-right" style={preset.fontSize20} />
                        </Button>
                    </>
                )}
            </View>
        </Container>
    );
};

const Row = ({ label, value }) => (
    <View style={[preset.flexDirectionRow, preset.marginTopTiny, preset.marginBottomTiny]}>
        <Text style={[preset.flex0, preset.colorGrey, preset.fontSize14]}>{label}</Text>
        <Text style={[preset.flex1, preset.textAlignRight, preset.fontSize14]}>{value}</Text>
    </View>
);

export default NewSavingsScreen;

import { useCallback, useContext, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Alert, TextInput, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Button, Container, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import AmountInput from "../../../components/AmountInput";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import { Spacing } from "../../../constants/dimension";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";
import { openTx } from "../../../utils/ether-scan-utils";
import Sentry from "../../../utils/Sentry";
import SnackBar from "../../../utils/SnackBar";

const TransferAssetScreen = () => {
    const { t } = useTranslation(["asset", "common"]);
    const { getParam } = useNavigation();
    const { ethereumChain } = useContext(ChainContext);
    const { getBalance } = useContext(BalancesContext);
    const [address, setAddress] = useState<string>("");
    const [error, setError] = useState("");
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [inProgress, setInProgress] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const asset: ERC20Asset = getParam("asset");
    const onChangeAddress = useCallback(newAddress => {
        const valid = newAddress.startsWith("0x") && newAddress.length === 42;
        setError(valid ? "" : t("notAValidAddress"));
        setAddress(newAddress);
    }, []);
    const onTransfer = useCallback(async () => {
        Alert.alert(
            t("transfer"),
            t("transfer.confirm", { address, symbol: asset.symbol, amount: formatValue(amount!, asset.decimals) }),
            [{ text: t("common:cancel"), style: "cancel" }, { text: t("common:ok"), onPress: transfer }]
        );
    }, [address, asset, amount]);
    const transfer = useCallback(async () => {
        if (ethereumChain && amount) {
            try {
                setInProgress(true);
                if (asset.ethereumAddress.isZero()) {
                    const tx = await ethereumChain.transferETHAsync(address, amount);
                    setTxHash(tx.hash!);
                    await tx.wait();
                } else {
                    const tx = await ethereumChain.transferERC20Async(asset, address, amount);
                    setTxHash(tx.hash!);
                    await tx.wait();
                }
                setAddress("");
                setAmount(null);
                SnackBar.success(t("transferSuccess"));
            } catch (e) {
                SnackBar.danger(e.message);
                Sentry.error(e);
            } finally {
                setTxHash(null);
                setInProgress(false);
            }
        }
    }, [ethereumChain, address, amount]);
    const onPress = useCallback(() => {
        if (txHash) {
            openTx(txHash);
        }
    }, [txHash]);
    return (
        <Container>
            <SubtitleText aboveText={true}>
                {asset.symbol} {t("transfer")}
            </SubtitleText>
            {inProgress ? (
                <>
                    <Spinner label={t("processing")} />
                    {txHash && (
                        <Button bordered={true} onPress={onPress} style={[preset.marginTopLarge, preset.alignCenter]}>
                            <Text numberOfLines={1} ellipsizeMode="middle">
                                {t("viewTransaction")}
                            </Text>
                        </Button>
                    )}
                </>
            ) : (
                <View style={{ margin: Spacing.large }}>
                    <AmountInput
                        asset={asset}
                        max={getBalance(asset.ethereumAddress)}
                        disabled={inProgress}
                        onChangeAmount={setAmount}
                        style={preset.marginBottomLarge}
                    />
                    <TextInput
                        keyboardType={"ascii-capable"}
                        placeholder={t("receiver")}
                        value={address}
                        editable={!inProgress}
                        onChangeText={onChangeAddress}
                        style={[{ borderBottomColor: platform.brandLight, borderBottomWidth: 2, fontSize: 36 }]}
                    />
                    {error.length > 0 && (
                        <Text style={[preset.marginNormal, preset.colorDanger, preset.fontSize14]}>{error}</Text>
                    )}
                    <Button
                        primary={true}
                        rounded={true}
                        block={true}
                        style={preset.marginTopLarge}
                        onPress={onTransfer}
                        disabled={!!error || inProgress}>
                        <Text>{t("transfer")}</Text>
                    </Button>
                </View>
            )}
        </Container>
    );
};

export default TransferAssetScreen;

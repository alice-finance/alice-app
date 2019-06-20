import { useCallback, useContext, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Alert, TextInput, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { BigNumber } from "ethers/utils";
import { Button, Container, Text, Toast } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import AmountInput from "../../../components/AmountInput";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import { Spacing } from "../../../constants/dimension";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ConnectorContext } from "../../../contexts/ConnectorContext";
import ERC20Token from "../../../evm/ERC20Token";
import preset from "../../../styles/preset";
import { formatValue, toBigNumber } from "../../../utils/big-number-utils";
import { openTx } from "../../../utils/ether-scan-utils";

const TransferAssetScreen = () => {
    const { t } = useTranslation(["asset", "common"]);
    const { getParam } = useNavigation();
    const { ethereumConnector } = useContext(ConnectorContext);
    const { getBalance } = useContext(BalancesContext);
    const [address, setAddress] = useState<string>("");
    const [error, setError] = useState("");
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [inProgress, setInProgress] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const asset: ERC20Token = getParam("asset");
    const onChangeAddress = useCallback(newAddress => {
        const valid = newAddress.startsWith("0x") && newAddress.length === 42;
        setError(valid ? "" : "notAValidAddress");
        setAddress(newAddress);
    }, []);
    const onTransfer = useCallback(async () => {
        Alert.alert(
            t("transfer"),
            t("transfer.confirm", { address, symbol: asset.symbol, amount: formatValue(amount!, asset.decimals, 2) }),
            [{ text: t("common:cancel"), style: "cancel" }, { text: t("common:ok"), onPress: transfer }]
        );
    }, [address, asset, amount]);
    const transfer = useCallback(async () => {
        if (amount) {
            try {
                setInProgress(true);
                if (asset.ethereumAddress.isNull()) {
                    const tx = await ethereumConnector!.wallet.sendTransaction({
                        to: address,
                        value: amount.toHexString()
                    });
                    setTxHash(tx.hash!);
                    await tx.wait();
                } else {
                    const erc20 = ethereumConnector!.getERC20(asset.ethereumAddress.toLocalAddressString());
                    const tx = await erc20.transfer(address, amount);
                    setTxHash(tx.hash);
                    await tx.wait();
                }
                setAddress("");
                setAmount(null);
                Toast.show({ text: t("transferSuccess") });
            } catch (e) {
                Toast.show({ text: e.message, duration: 10000 });
            } finally {
                setTxHash(null);
                setInProgress(false);
            }
        }
    }, [ethereumConnector, address, amount]);
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
                        keyboardType={"numeric"}
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

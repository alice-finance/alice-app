import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway";
import { Body, Button, Container, Content, Icon, Left, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import BalanceView from "../../../components/BalanceView";
import BigNumberText from "../../../components/BigNumberText";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import HeadlineText from "../../../components/HeadlineText";
import TokenIcon from "../../../components/TokenIcon";
import { BalancesContext } from "../../../contexts/BalancesContext";
import usePendingWithdrawalListener from "../../../hooks/usePendingWithdrawalListener";
import preset from "../../../styles/preset";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { push, getParam } = useNavigation();
    const asset: ERC20Asset = getParam("asset");
    const { getBalance } = useContext(BalancesContext);
    const { receipt } = usePendingWithdrawalListener(asset);
    const balance = getBalance(asset.loomAddress);

    if (asset) {
        return (
            <Container>
                <Content>
                    <TokenView asset={asset} />
                    <View style={[preset.flexDirectionRow, preset.marginNormal]}>
                        <Button
                            primary={true}
                            rounded={true}
                            block={true}
                            style={[preset.flex1, preset.marginTiny]}
                            onPress={useCallback(() => push("MyAddress"), [asset])}>
                            <Text>{t("receive")}</Text>
                        </Button>
                        <Button
                            primary={true}
                            bordered={true}
                            rounded={true}
                            block={true}
                            style={[preset.flex1, preset.marginTiny]}
                            onPress={useCallback(() => push("TransferAsset", { asset }), [asset])}>
                            <Text>{t("send")}</Text>
                        </Button>
                    </View>
                    <HeadlineText aboveText={true}>{t("myAssetsInAliceNetwork")}</HeadlineText>
                    <CaptionText>{t("myAssetsInAliceNetwork.description")}</CaptionText>
                    <View
                        style={[
                            preset.alignCenter,
                            preset.flexDirectionColumn,
                            preset.alignItemsCenter,
                            preset.marginTopNormal
                        ]}>
                        <BalanceView asset={asset} balance={balance} />
                        <Text style={[preset.marginLeftTiny, preset.fontSize24]}>{t("deposited")}</Text>
                    </View>
                    <Button
                        primary={true}
                        rounded={true}
                        transparent={true}
                        style={preset.alignFlexEnd}
                        onPress={useCallback(() => push("ManageDeposits", { asset }), [asset])}>
                        <Text>{t("manageDepositedAmount")}</Text>
                    </Button>
                    <HeadlineText aboveText={true}>{t("pendingTransactions")}</HeadlineText>
                    {receipt ? <PendingWithdrawalItemView asset={asset} receipt={receipt} /> : <EmptyView />}
                </Content>
            </Container>
        );
    } else {
        return <Container />;
    }
};

const TokenView = ({ asset }: { asset: ERC20Asset }) => {
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(asset.loomAddress).add(getBalance(asset.ethereumAddress));
    return (
        <View style={[preset.flexDirectionRow, preset.justifyContentCenter, preset.alignItemsCenter]}>
            <TokenIcon
                address={asset.ethereumAddress.toLocalAddressString()}
                width={64}
                height={64}
                style={preset.marginNormal}
            />
            <View style={preset.marginRightNormal}>
                <BalanceView style={preset.justifyContentCenter} asset={asset} balance={balance} />
                <Text style={[preset.fontSize16, preset.colorGrey]}>{asset.name}</Text>
            </View>
        </View>
    );
};

const PendingWithdrawalItemView = ({ asset, receipt }: { asset: ERC20Asset; receipt: IWithdrawalReceipt }) => {
    const { t } = useTranslation("asset");
    const color = platform.brandWarning;
    return (
        <ListItem noBorder={true}>
            <Left style={[preset.flex0]}>
                <TypeBadge inProgress={true} color={color} withdraw={true} />
            </Left>
            <Body style={[preset.flex1, preset.marginLeftSmall]}>
                <Text note={true} style={[preset.padding0, preset.marginLeftSmall]}>
                    {t("withdrawal")} ({t("processing")})
                </Text>
                <BigNumberText
                    value={toBigNumber(receipt.tokenAmount.toString())}
                    style={[preset.marginLeftSmall, preset.fontSize20]}
                    suffix={" " + asset.symbol}
                />
            </Body>
        </ListItem>
    );
};

const TypeBadge = ({ color, inProgress, withdraw }) => {
    return (
        <View
            style={{
                borderColor: color,
                borderWidth: platform.borderWidth * 2,
                width: 48,
                height: 48,
                borderRadius: 24,
                paddingTop: 14
            }}>
            <Icon
                type="AntDesign"
                name={inProgress ? "hourglass" : withdraw ? "arrowleft" : "arrowright"}
                style={[preset.fontSize20, preset.alignCenter, { color }]}
            />
        </View>
    );
};

export default ManageAssetScreen;

import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Portal } from "react-native-paper";
import { useNavigation } from "react-navigation-hooks";

import { Container } from "native-base";
import CaptionText from "../../../components/CaptionText";
import DepositSlider from "../../../components/DepositSlider";
import HeadlineText from "../../../components/HeadlineText";
import SubtitleText from "../../../components/SubtitleText";
import TokenIcon from "../../../components/TokenIcon";
import { Spacing } from "../../../constants/dimension";
import { BalancesContext } from "../../../contexts/BalancesContext";
import ERC20Token from "../../../evm/ERC20Token";
import { formatValue } from "../../../utils/erc20-utils";

const ManageAssetScreen = () => {
    const { getParam } = useNavigation();
    const { t } = useTranslation("asset");
    const token: ERC20Token = getParam("token");
    if (token) {
        return (
            <Portal.Host>
                <Container>
                    <TokenView token={token} />
                    <HeadlineText aboveText={true}>{t("depositAmount")}</HeadlineText>
                    <CaptionText small={true}>{t("depositAmount.description")}</CaptionText>
                    <DepositSlider token={token} />
                </Container>
            </Portal.Host>
        );
    } else {
        return <Container />;
    }
};

const TokenView = ({ token }: { token: ERC20Token }) => {
    const { getBalance } = useContext(BalancesContext);
    return (
        <View style={{ alignItems: "center", margin: Spacing.normal }}>
            <TokenIcon
                address={token.ethereumAddress.toLocalAddressString()}
                width={72}
                height={72}
                style={{ marginLeft: Spacing.small, flex: 0 }}
            />
            <SubtitleText aboveText={true}>{token.name}</SubtitleText>
            <CaptionText>
                {formatValue(getBalance(token.loomAddress).add(getBalance(token.ethereumAddress)), token.decimals, 2)}{" "}
                {token.symbol}
            </CaptionText>
        </View>
    );
};

export default ManageAssetScreen;

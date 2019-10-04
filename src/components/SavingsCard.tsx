import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Body, Button, Card, CardItem, Left, Text } from "native-base";
import TokenIcon from "../components/TokenIcon";
import { SavingsContext } from "../contexts/SavingsContext";
import useAssetBalancesUpdater from "../hooks/useAssetBalancesUpdater";
import useAsyncEffect from "../hooks/useAsyncEffect";
import preset from "../styles/preset";
import Sentry from "../utils/Sentry";
import BigNumberText from "./BigNumberText";
import Spinner from "./Spinner";
import StartSavingButton from "./StartSavingsButton";

const SavingsCard = () => {
    const { t } = useTranslation("finance");
    const { asset, apr } = useContext(SavingsContext);
    const { updating, update } = useAssetBalancesUpdater();
    const refreshing = !asset || updating;
    useAsyncEffect(update, []);
    return (
        <View style={[preset.marginNormal]}>
            <Card>
                <Header asset={asset} />
                <CardItem>
                    <View style={[preset.flex1, preset.flexDirectionColumn, preset.alignItemsCenter]}>
                        <Text style={[preset.fontSize16]}>{t("currentApr")}</Text>
                        {apr ? (
                            <BigNumberText
                                value={apr}
                                suffix={"%"}
                                decimalPlaces={2}
                                style={[preset.fontSize48, preset.fontWeightBold]}
                            />
                        ) : (
                            <Spinner compact={true} />
                        )}
                    </View>
                </CardItem>
                <Footer refreshing={refreshing} />
            </Card>
        </View>
    );
};

const Header = ({ asset }) => (
    <CardItem>
        <Left>
            <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={32} height={32} />
            <Body style={preset.marginLeftNormal}>
                <Text style={[preset.fontSize20, preset.colorGrey]}>{asset!.name}</Text>
            </Body>
        </Left>
    </CardItem>
);

const Footer = ({ refreshing }) => {
    return (
        <CardItem>
            <View style={[preset.flex1, preset.flexDirectionRow, preset.marginBottomSmall]}>
                <SavingsSimulationButton />
                <View style={preset.marginTiny} />
                <StartSavingButton disabled={refreshing} />
            </View>
        </CardItem>
    );
};

const SavingsSimulationButton = () => {
    const { t } = useTranslation("finance");
    const { push } = useNavigation();
    const onShowLeaderboard = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.SIMULATION);
        push("SavingsSimulation");
    }, []);
    return (
        <Button primary={true} bordered={true} rounded={true} onPress={onShowLeaderboard} style={preset.flex1}>
            <Text style={preset.fontSize16}>{t("simulation")}</Text>
        </Button>
    );
};

export default SavingsCard;

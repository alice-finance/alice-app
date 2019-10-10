import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ChainContext } from "../../contexts/ChainContext";
import { SavingsContext } from "../../contexts/SavingsContext";
import useAsyncEffect from "../../hooks/useAsyncEffect";
import preset from "../../styles/preset";
import NewSavingsCard from "../cards/NewSavingsCard";
import CaptionText from "../texts/CaptionText";
import NoteText from "../texts/NoteText";
import SubtitleText from "../texts/SubtitleText";

const NewSavingsSection = () => {
    const { t } = useTranslation("savings");
    useCurrentAPRUpdater();
    return (
        <View style={preset.marginBottomHuge}>
            <SubtitleText aboveText={true}>{t("savings")}</SubtitleText>
            <CaptionText>{t("savings.description")}</CaptionText>
            <NewSavingsCard />
            <NoteText style={[preset.alignFlexEnd, preset.marginRightNormal]}>{t("newSavings.note")}</NoteText>
        </View>
    );
};

const useCurrentAPRUpdater = () => {
    const { loomChain } = useContext(ChainContext);
    const { setAPR } = useContext(SavingsContext);
    useAsyncEffect(async () => {
        const market = loomChain!.getMoneyMarket();
        setAPR(toBigNumber(await market.getCurrentSavingsAPR()).mul(toBigNumber(100)));
    }, []);
};

export default NewSavingsSection;

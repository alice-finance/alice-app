import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Container, Content } from "native-base";
import WalletCard from "../../../components/cards/WalletCard";
import MySavingsSection from "../../../components/sections/MySavingsSection";
import NewSavingsSection from "../../../components/sections/NewSavingsSection";
import Spinner from "../../../components/Spinner";
import CaptionText from "../../../components/texts/CaptionText";
import TitleText from "../../../components/texts/TitleText";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useMySavingsLoader from "../../../hooks/useMySavingsLoader";
import preset from "../../../styles/preset";

const HomeScreen = () => {
    const { t } = useTranslation("home");
    const { isReadOnly } = useContext(ChainContext);
    const { myRecords } = useContext(SavingsContext);
    const { load } = useMySavingsLoader();
    useAsyncEffect(load, []);
    return (
        <Container>
            <Content>
                <View>
                    <TitleText aboveText={true}>{t("title")}</TitleText>
                    <CaptionText style={preset.marginBottomNormal}>{t("description")}</CaptionText>
                    <View style={preset.marginBottomLarge}>
                        <WalletCard />
                    </View>
                    {myRecords ? (
                        isReadOnly || myRecords.length === 0 ? (
                            <NewSavingsSection />
                        ) : (
                            <MySavingsSection />
                        )
                    ) : (
                        <Spinner compact={true} />
                    )}
                </View>
            </Content>
        </Container>
    );
};

export default HomeScreen;

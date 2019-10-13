import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";

import { Container, Content } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import NewSavingsCard from "../../../components/cards/NewSavingsCard";
import PendingAmountCard from "../../../components/cards/PendingAmountCard";
import SavingsRecordCard from "../../../components/cards/SavingsRecordCard";
import WalletCard from "../../../components/cards/WalletCard";
import EmptyView from "../../../components/EmptyView";
import Spinner from "../../../components/Spinner";
import CaptionText from "../../../components/texts/CaptionText";
import NoteText from "../../../components/texts/NoteText";
import SubtitleText from "../../../components/texts/SubtitleText";
import TitleText from "../../../components/texts/TitleText";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useCurrentAPRUpdater from "../../../hooks/useCurrentAPRUpdater";
import useMySavingsLoader from "../../../hooks/useMySavingsLoader";
import usePendingDepositChecker from "../../../hooks/usePendingDepositChecker";
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
                    <PendingAmountsSection />
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

const PendingAmountsSection = () => {
    const { t } = useTranslation("home");
    const { getAssetByAddress } = useContext(AssetContext);
    const { getBalance } = useContext(BalancesContext);
    const { addressesWithPendingDeposit } = usePendingDepositChecker();
    return (
        <>
            {addressesWithPendingDeposit.length > 0 && (
                <SubtitleText aboveText={true}>{t("pendingAmount")}</SubtitleText>
            )}
            {addressesWithPendingDeposit.map(address => (
                <PendingAmountCard
                    key={address.toLocalAddressString()}
                    asset={getAssetByAddress(address)}
                    amount={getBalance(address)}
                />
            ))}
        </>
    );
};

const NewSavingsSection = () => {
    const { t } = useTranslation("savings");
    useCurrentAPRUpdater();
    return (
        <View style={preset.marginBottomHuge}>
            <SubtitleText aboveText={true}>{t("title")}</SubtitleText>
            <CaptionText>{t("description")}</CaptionText>
            <NewSavingsCard />
            <NoteText style={[preset.alignFlexEnd, preset.marginRightNormal]}>{t("newSavings.note")}</NoteText>
        </View>
    );
};

const MySavingsSection = () => {
    const { myRecords } = useContext(SavingsContext);
    const { t } = useTranslation("savings");
    return (
        <View style={preset.marginBottomNormal}>
            <SubtitleText aboveText={true}>{t("myProfits")}</SubtitleText>
            {myRecords ? <MySavingsCarousel myRecords={myRecords} /> : <Spinner compact={true} />}
        </View>
    );
};

const MySavingsCarousel = ({ myRecords }) => {
    const { t } = useTranslation("savings");
    const renderItem = useCallback(({ item }) => <SavingsRecordCard record={item} />, []);
    const [sliderWidth] = useState(Dimensions.get("window").width);
    const [selection, setSelection] = useState(0);
    return myRecords.length > 0 ? (
        <View>
            <Carousel
                data={myRecords}
                renderItem={renderItem}
                sliderWidth={sliderWidth}
                itemWidth={sliderWidth}
                activeSlideAlignment={"start"}
                inactiveSlideScale={1.0}
                onSnapToItem={setSelection}
                contentContainerCustomStyle={{ flexGrow: 0 }}
                containerCustomStyle={{ flexGrow: 0 }}
            />
            <Pagination
                dotsLength={myRecords.length}
                activeDotIndex={selection}
                dotColor={platform.colorPrimary}
                inactiveDotColor={platform.colorInfo}
            />
        </View>
    ) : (
        <EmptyView text={t("noSavingsHistory")} />
    );
};

export default HomeScreen;

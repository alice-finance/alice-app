import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";

import platform from "../../../native-base-theme/variables/platform";
import { SavingsContext } from "../../contexts/SavingsContext";
import preset from "../../styles/preset";
import SavingsRecordCard from "../cards/SavingsRecordCard";
import EmptyView from "../EmptyView";
import Spinner from "../Spinner";
import SubtitleText from "../texts/SubtitleText";

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

export default MySavingsSection;

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { Body, Container, Left, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import TitleText from "../../../components/TitleText";
import preset from "../../../styles/preset";

const items = [
    { name: "Upxide", homepageUrl: "https://www.upxide.com", url: "https://www.upxide.com/exchange/KRW_DAI" },
    { name: "Coinbase", homepageUrl: "https://www.coinbase.com", url: "https://www.coinbase.com/price/dai" },
    { name: "Bibox", homepageUrl: "https://www.bibox.com", url: "https://www.bibox.com/exchange?coinPair=ETH_DAI" },
    { name: "Yobit", homepageUrl: "https://yobit.net", url: "https://yobit.net/en/trade/DAI/USD" }
];

const ExchangeScreen = () => {
    const renderItem = ({ item }) => <ItemView name={item.name} homepageUrl={item.homepageUrl} url={item.url} />;
    return (
        <Container>
            <FlatList
                data={items}
                keyExtractor={defaultKeyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={<ListHeader />}
                ListEmptyComponent={<EmptyView />}
            />
        </Container>
    );
};

const ListHeader = () => {
    const { t } = useTranslation("exchange");
    return (
        <View>
            <TitleText aboveText={true}>{t("title")}</TitleText>
            <CaptionText style={preset.marginBottomLarge}>{t("description")}</CaptionText>
        </View>
    );
};

const ItemView = ({ name, homepageUrl, url }: { name: string; homepageUrl: string; url: string }) => {
    const { push } = useNavigation();
    return (
        <ListItem noBorder={true} onPress={useCallback(() => push("ExchangeWebView", { name, url }), [])}>
            <Left style={[preset.flex0, preset.marginLeftSmall, preset.marginRightSmall]}>
                <Badge name={name} />
            </Left>
            <Body>
                <Text style={preset.fontSize20}>{name}</Text>
                <Text note={true}>{homepageUrl}</Text>
            </Body>
        </ListItem>
    );
};

const Badge = ({ name }) => {
    const color = platform.brandInfo;
    return (
        <View
            style={{
                borderColor: color,
                borderWidth: platform.borderWidth * 2,
                width: 48,
                height: 48,
                borderRadius: 24,
                paddingTop: 4
            }}>
            <Text style={[preset.fontWeightBold, preset.fontSize24, preset.alignCenter, { color }]}>
                {name.charAt(0)}
            </Text>
        </View>
    );
};

export default ExchangeScreen;

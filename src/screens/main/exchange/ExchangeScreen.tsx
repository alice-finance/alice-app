import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { Body, Container, Icon, Left, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import TitleText from "../../../components/TitleText";
import preset from "../../../styles/preset";

export class Exchange {
    constructor(readonly name: string, readonly market: string, readonly homepageUrl: string, readonly url: string) {}
}

const items = [
    new Exchange("Upxide", "KRW", "https://www.upxide.com/", "https://www.upxide.com/exchange/KRW_DAI"),
    new Exchange("Coinbase", "USD", "https://www.coinbase.com", "https://www.coinbase.com/price/dai"),
    new Exchange("Bibox", "ETH", "https://www.bibox.com", "https://www.bibox.com/exchange?coinPair=ETH_DAI"),
    new Exchange("Yobit", "USD", "https://yobit.net", "https://yobit.net/en/trade/DAI/USD")
];

const ExchangeScreen = () => {
    const renderItem = ({ item }) => <ItemView exchange={item} />;
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

const ItemView = ({ exchange }: { exchange: Exchange }) => {
    const { push } = useNavigation();
    const onPress = useCallback(() => push("ExchangeWebView", { exchange }), []);
    return (
        <ListItem noBorder={true} onPress={onPress}>
            <Left style={[preset.flex0, preset.marginLeftSmall, preset.marginRightSmall]}>
                <Badge name={exchange.name} />
            </Left>
            <Body>
                <Text style={[preset.fontSize20, preset.fontWeightBold]}>{exchange.name}</Text>
                <Text note={true}>DAI ↔ {exchange.market}</Text>
            </Body>
            <Icon type="MaterialIcons" name="chevron-right" style={preset.colorPrimary} />
        </ListItem>
    );
};

const Badge = ({ name }) => {
    const color = platform.brandPrimary;
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
            <Text style={[preset.fontSize24, preset.alignCenter, { color }]}>{name.charAt(0)}</Text>
        </View>
    );
};

export default ExchangeScreen;

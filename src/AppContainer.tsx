import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import {
    createAppContainer,
    createBottomTabNavigator,
    createStackNavigator,
    createSwitchNavigator
} from "react-navigation";
import { useNavigation } from "react-navigation-hooks";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import { fromRight } from "react-navigation-transitions";

import platform from "../native-base-theme/variables/platform";
import TabBarIcon from "./components/TabBarIcon";
import AssetsScreen from "./screens/main/assets/AssetsScreen";
import DepositScreen from "./screens/main/assets/DepositScreen";
import ManageAssetScreen from "./screens/main/assets/ManageAssetScreen";
import MyAddressScreen from "./screens/main/assets/MyAddressScreen";
import FinanceScreen from "./screens/main/finance/FinanceScreen";
import NewSavingsScreen from "./screens/main/finance/NewSavingsScreen";
import ProfileScreen from "./screens/main/profile/ProfileScreen";
import SplashScreen from "./screens/SplashScreen";
import CompleteScreen from "./screens/start/CompleteScreen";
import ConfirmMnemonicScreen from "./screens/start/ConfirmMnemonicScreen";
import ImportMnemonicScreen from "./screens/start/ImportMnemonicScreen";
import NewMnemonicScreen from "./screens/start/NewMnemonicScreen";
import StartScreen from "./screens/start/StartScreen";

const createDefaultStackNavigator = (routeConfigMap, stackConfig = {}) =>
    createStackNavigator(routeConfigMap, {
        ...stackConfig,
        defaultNavigationOptions: {
            headerBackTitle: null,
            headerStyle: {
                borderBottomWidth: 0,
                elevation: 0
            },
            headerLeftContainerStyle: {
                paddingLeft: Platform.OS === "ios" ? 4 : 0
            },
            headerTintColor: platform.brandPrimary
        }
    });

const tabBarNavigationOptions = (name, iconName) => ({ screenProps }) => ({
    tabBarLabel: screenProps.t(name),
    tabBarIcon: ({ focused, horizontal, tintColor }) => <TabBarIcon name={iconName} tintColor={tintColor} />
});

const StartNavigator = createDefaultStackNavigator(
    {
        Start: StartScreen,
        NewMnemonic: NewMnemonicScreen,
        ConfirmMnemonic: ConfirmMnemonicScreen,
        Complete: CompleteScreen,
        ImportMnemonic: ImportMnemonicScreen
    },
    {
        transitionConfig: () => fromRight()
    }
);

const tabs = {
    FinanceTab: {
        screen: createDefaultStackNavigator({
            Finance: FinanceScreen,
            NewSavings: NewSavingsScreen
        }),
        navigationOptions: tabBarNavigationOptions("finance", "present")
    },
    AssetsTab: {
        screen: createDefaultStackNavigator({
            Assets: AssetsScreen,
            ManageAsset: ManageAssetScreen,
            MyAddress: MyAddressScreen,
            Deposit: DepositScreen
        }),
        navigationOptions: tabBarNavigationOptions("assets", "pie-chart")
    },
    ProfileTab: {
        screen: ProfileScreen,
        navigationOptions: tabBarNavigationOptions("profile", "user")
    }
};

const IOSTabNavigator = createBottomTabNavigator(tabs, {
    tabBarOptions: {
        activeTintColor: platform.brandPrimary,
        inactiveTintColor: "darkgrey",
        style: {
            backgroundColor: "white"
        }
    }
});

const AndroidTabNavigator = createMaterialBottomTabNavigator(tabs, {
    activeColor: platform.brandPrimary,
    inactiveColor: "darkgrey",
    tabBarColor: platform.androidRippleColor,
    barStyle: {
        backgroundColor: "white",
        shadowColor: "darkgrey",
        shadowOpacity: 0.8,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 }
    },
    backBehavior: "none",
    shifting: false
});

const MainNavigator = Platform.OS === "ios" ? IOSTabNavigator : AndroidTabNavigator;

const AppNavigator = createSwitchNavigator({
    Splash: SplashScreen,
    Start: StartNavigator,
    Main: MainNavigator
});

const I18nAppNavigator = Component => {
    const HOC = () => {
        const { t } = useTranslation("common");
        const navigation = useNavigation();
        return <Component navigation={navigation} screenProps={{ t }} />;
    };
    HOC.router = Component.router;
    return HOC;
};

const AppContainer = createAppContainer(I18nAppNavigator(AppNavigator));

export default AppContainer;

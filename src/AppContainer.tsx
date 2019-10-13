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

import platform from "../native-base-theme/variables/platform";
import TabBarIcon from "./components/TabBarIcon";
import AuthScreen from "./screens/AuthScreen";
import DepositScreen from "./screens/main/assets/DepositScreen";
import ManageAssetScreen from "./screens/main/assets/ManageAssetScreen";
import ManageDepositsScreen from "./screens/main/assets/ManageDepositsScreen";
import MyAddressScreen from "./screens/main/assets/MyAddressScreen";
import TransferAssetScreen from "./screens/main/assets/TransferAssetScreen";
import WithdrawalScreen from "./screens/main/assets/WithdrawalScreen";
import NewSavingsScreen from "./screens/main/finance/NewSavingsScreen";
import SavingsScreen from "./screens/main/finance/SavingsScreen";
import SavingsSimulationScreen from "./screens/main/finance/SavingsSimulationScreen";
import HomeScreen from "./screens/main/home/HomeScreen";
import ReceiveScreen from "./screens/main/home/ReceiveScreen";
import SendScreen from "./screens/main/home/SendScreen";
import ProfileScreen from "./screens/main/profile/ProfileScreen";
import ResetAccountScreen from "./screens/main/profile/ResetAccountScreen";
import NotConnectedScreen from "./screens/NotConnectedScreen";
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
            headerTitleStyle: {
                color: platform.brandDark
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

const tabs = {
    HomeTab: {
        screen: HomeScreen,
        navigationOptions: tabBarNavigationOptions("home", "home")
    },
    SavingsTab: {
        screen: SavingsScreen,
        navigationOptions: tabBarNavigationOptions("savings", "present")
    },
    ProfileTab: {
        screen: ProfileScreen,
        navigationOptions: tabBarNavigationOptions("profile", "user")
    }
};

const IOSTabNavigator = createBottomTabNavigator(tabs, {
    backBehavior: "initialRoute",
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
    backBehavior: "initialRoute",
    shifting: false
});

const MainNavigator = createDefaultStackNavigator({
    Tab: Platform.OS === "ios" ? IOSTabNavigator : AndroidTabNavigator,
    Receive: ReceiveScreen,
    Send: SendScreen,
    NewSavings: NewSavingsScreen,
    SavingsSimulation: SavingsSimulationScreen,
    ManageAsset: ManageAssetScreen,
    MyAddress: MyAddressScreen,
    TransferAsset: TransferAssetScreen,
    ManageDeposits: ManageDepositsScreen,
    Deposit: DepositScreen,
    Withdrawal: WithdrawalScreen,
    ResetAccount: ResetAccountScreen,
    Start: StartScreen,
    NewMnemonic: NewMnemonicScreen,
    ConfirmMnemonic: ConfirmMnemonicScreen,
    Complete: CompleteScreen,
    ImportMnemonic: ImportMnemonicScreen,
    Auth: AuthScreen
});

const AppNavigator = createSwitchNavigator({
    Splash: SplashScreen,
    NotConnected: NotConnectedScreen,
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

import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { AsyncStorage, InteractionManager, StyleSheet } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Button, Container, Content, Icon, Text, View } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import CaptionText from "../components/texts/CaptionText";
import TitleText from "../components/texts/TitleText";
import useAsyncEffect from "../hooks/useAsyncEffect";
import preset from "../styles/preset";
import SnackBar from "../utils/SnackBar";

const PASSWORD_LENGTH = 6;

const AuthScreen = () => {
    const { t } = useTranslation(["auth"]);
    const { pop, getParam } = useNavigation();
    const { passcode, clearPasscode, appendPasscode } = usePasscode();
    const { passcode: confirm, clearPasscode: clearConfirm, appendPasscode: appendConfirm } = usePasscode();
    const needsRegistration = getParam("needsRegistration");
    const confirming = needsRegistration && passcode.length >= PASSWORD_LENGTH;
    const onMatch = () => {
        pop();
        getParam("onSuccess")();
    };
    const caption = confirming
        ? "pleaseEnterYourPasswordAgain"
        : needsRegistration
        ? "pleaseEnterYourNewPassword"
        : "pleaseEnterYourPassword";
    usePasscodeChecker(needsRegistration, passcode, confirm, onMatch, needsRegistration ? clearConfirm : clearPasscode);
    return (
        <Container>
            <Content>
                <View style={preset.flex1}>
                    <TitleText aboveText={true}>{t(needsRegistration ? "registration" : "authentication")}</TitleText>
                    <CaptionText>{t(caption)}</CaptionText>
                    <Circles passcode={confirming ? confirm : passcode} />
                    <KeyPad appendPasscode={confirming ? appendConfirm : appendPasscode} />
                </View>
            </Content>
        </Container>
    );
};

AuthScreen.getSavedPasscode = () => AsyncStorage.getItem("passcode");

AuthScreen.savePasscode = passcode => AsyncStorage.setItem("passcode", passcode);

AuthScreen.navigationOptions = ({ navigation }) => {
    if (navigation.getParam("firstTime")) {
        return {
            headerLeft: null
        };
    }
};

const Circles = ({ passcode }) => (
    <View style={[preset.flex1, preset.flexDirectionRow, preset.justifyContentCenter, preset.marginTopHuge]}>
        {new Array(PASSWORD_LENGTH).fill(0).map((value, index) => {
            return passcode.length - 1 >= index ? <ActiveItem key={index} /> : <InactiveItem key={index} />;
        })}
    </View>
);

const ActiveItem = () => <View style={styles.filledCircle} />;
const InactiveItem = () => <View style={styles.emptyCircle} />;

const KeyPad = ({ appendPasscode }) => (
    <View style={[preset.flexDirectionRow, preset.marginLarge, preset.alignItemsCenter, preset.flexWrapWrap]}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, undefined, 0, -1].map((num, index) => (
            <Key key={index} num={num} onPress={num !== undefined ? appendPasscode : undefined} />
        ))}
    </View>
);

const Key = ({ num, onPress }: { num?: number; onPress?: (num: number) => void }) => (
    <Button
        disabled={num === undefined}
        dark={true}
        transparent={true}
        rounded={true}
        onPress={onPress ? useCallback(() => onPress(num || 0), [num, onPress]) : undefined}
        style={{ width: "33%", height: 96, justifyContent: "center" }}>
        {num === -1 ? <Icon type="MaterialIcons" name="backspace" /> : <Text style={[preset.fontSize32]}>{num}</Text>}
    </Button>
);

const usePasscode = () => {
    const [passcode, setPasscode] = useState<string>("");
    const clearPasscode = useCallback(() => setPasscode(""), [setPasscode]);
    const appendPasscode = useCallback(
        (num: number) => {
            InteractionManager.runAfterInteractions(() => {
                if (num === -1) {
                    setPasscode(prevState => (prevState.length > 0 ? prevState.slice(0, -1) : prevState));
                } else {
                    setPasscode(prevState => (prevState.length < PASSWORD_LENGTH ? prevState + num : prevState));
                }
            });
        },
        [passcode, setPasscode]
    );
    return { passcode, clearPasscode, appendPasscode };
};

const usePasscodeChecker = (needsRegistration, passcode, confirm, onMatch, onError) => {
    const { t } = useTranslation(["auth"]);
    useAsyncEffect(async () => {
        InteractionManager.runAfterInteractions(async () => {
            if (needsRegistration) {
                const result = isConfirmed(passcode, confirm);
                if (result) {
                    await AuthScreen.savePasscode(passcode);
                    SnackBar.success(t("passwordRegistered"));
                    onMatch();
                } else if (result !== null) {
                    SnackBar.danger(t("passwordNotMatched"));
                    onError();
                }
            } else {
                const result = await isMatched(passcode);
                if (result) {
                    onMatch();
                } else if (result !== null) {
                    SnackBar.danger(t("passwordNotMatched"));
                    onError();
                }
            }
        });
    }, [needsRegistration, passcode, confirm]);
};

const isConfirmed = (passcode, confirm) =>
    passcode.length >= PASSWORD_LENGTH && confirm.length >= PASSWORD_LENGTH ? passcode === confirm : null;

const isMatched = async passcode =>
    passcode.length >= PASSWORD_LENGTH ? (await AuthScreen.getSavedPasscode()) === passcode : null;

const styles = StyleSheet.create({
    filledCircle: {
        width: 24,
        height: 24,
        borderRadius: 100 / 2,
        borderColor: platform.brandPrimary,
        borderWidth: 2,
        backgroundColor: platform.brandPrimary,
        marginLeft: 12,
        marginRight: 12
    },
    emptyCircle: {
        width: 24,
        height: 24,
        borderRadius: 100 / 2,
        borderColor: platform.brandPrimary,
        borderWidth: 2,
        backgroundColor: "transparent",
        marginLeft: 12,
        marginRight: 12
    }
});

export default AuthScreen;

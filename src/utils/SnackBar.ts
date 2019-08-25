import { Dimensions, Platform } from "react-native";

import NativeSnackBar from "rn-snackbar";
import platform from "../../native-base-theme/variables/platform";

// See https://mydevice.io/devices/ for device dimensions
const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const getResolvedDimensions = () => {
    const { width, height } = Dimensions.get("window");
    if (width === 0 && height === 0) {
        return Dimensions.get("screen");
    }
    return { width, height };
};

const { height: D_HEIGHT, width: D_WIDTH } = getResolvedDimensions();

const isIPhoneX = (() => {
    return (
        (Platform.OS === "ios" &&
            ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) || (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT))) ||
        ((D_HEIGHT === XSMAX_HEIGHT && D_WIDTH === XSMAX_WIDTH) ||
            (D_HEIGHT === XSMAX_WIDTH && D_WIDTH === XSMAX_HEIGHT))
    );
})();

const padding = isIPhoneX ? 34 : 0;

const getOption = (backgroundColor, position) => {
    if (position !== "bottom" && position !== "top") {
        throw Error("position should be bottom or top");
    }

    return {
        style: position === "bottom" ? { paddingBottom: padding } : { paddingTop: padding },
        backgroundColor,
        textColor: platform.brandLight,
        tapToClose: true,
        position
    };
};

export default class SnackBar {
    public static success = (text: string, position: string = "bottom") => {
        NativeSnackBar.show(text, getOption(platform.brandSuccess, position));
    };

    public static danger = (text: string, position: string = "bottom") => {
        NativeSnackBar.show(text, getOption(platform.brandDanger, position));
    };

    public static info = (text: string, position: string = "bottom") => {
        NativeSnackBar.show(text, getOption(platform.brandInfo, position));
    };
}

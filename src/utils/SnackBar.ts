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

const paddingBottom = isIPhoneX ? 34 : 0;

export default class SnackBar {
    public static success = (text: string) => {
        NativeSnackBar.show(text, {
            style: { paddingBottom },
            backgroundColor: platform.brandSuccess,
            textColor: platform.brandLight,
            tapToClose: true
        });
    };

    public static danger = (text: string) => {
        NativeSnackBar.show(text, {
            style: { paddingBottom },
            backgroundColor: platform.brandDanger,
            textColor: platform.brandLight,
            tapToClose: true
        });
    };
}

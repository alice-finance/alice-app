import NativeSnackBar from "rn-snackbar";
import platform from "../../native-base-theme/variables/platform";

export default class SnackBar {
    public static success = (text: string) => {
        NativeSnackBar.show(text, {
            backgroundColor: platform.brandSuccess,
            textColor: platform.brandLight
        });
    };

    public static danger = (text: string) => {
        NativeSnackBar.show(text, {
            backgroundColor: platform.brandDanger,
            textColor: platform.brandLight
        });
    };
}

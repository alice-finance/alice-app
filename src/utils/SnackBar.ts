import { showMessage } from "react-native-flash-message";

export default class SnackBar {
    public static success = (text: string) => {
        showMessage({
            message: text,
            type: "success"
        });
    };

    public static danger = (text: string) => {
        showMessage({
            message: text,
            type: "danger"
        });
    };
}

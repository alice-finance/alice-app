import { StyleSheet } from "react-native";

import platform from "../../native-base-theme/variables/platform";
import { Spacing } from "../constants/dimension";

const preset = StyleSheet.create({
    flex0: { flex: 0 },
    flex1: { flex: 1 },
    flexDirectionRow: { flexDirection: "row" },
    fontSize20: { fontSize: 20 },
    alignFlexEnd: { alignSelf: "flex-end" },
    textAlignCenter: { textAlign: "center" },
    textAlignRight: { textAlign: "right" },
    colorDarkGrey: { color: "darkgrey" },
    colorPrimary: { color: platform.brandPrimary },
    marginLeftNormal: { marginLeft: Spacing.normal },
    marginRightTiny: { marginRight: Spacing.tiny },
    marginRightSmall: { marginRight: Spacing.small },
    marginRightNormal: { marginRight: Spacing.normal },
    marginTopSmall: { marginTop: Spacing.small },
    marginTopLarge: { marginTop: Spacing.large },
    marginBottom0: { marginBottom: 0 },
    marginBottomLarge: { marginBottom: Spacing.large },
    marginBottomSmall: { marginBottom: Spacing.small },
    marginNormal: { margin: Spacing.normal },
    paddingNormal: { padding: Spacing.normal }
});
export default preset;

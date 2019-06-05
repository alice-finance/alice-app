import { StyleSheet } from "react-native";

import platform from "../../native-base-theme/variables/platform";
import { Spacing } from "../constants/dimension";

const preset = StyleSheet.create({
    flex0: { flex: 0 },
    flex1: { flex: 1 },
    flexDirectionRow: { flexDirection: "row" },
    fontSize14: { fontSize: 14 },
    fontSize20: { fontSize: 20 },
    fontSize24: { fontSize: 24 },
    alignCenter: { alignSelf: "center" },
    alignFlexEnd: { alignSelf: "flex-end" },
    textAlignCenter: { textAlign: "center" },
    textAlignRight: { textAlign: "right" },
    colorDarkGrey: { color: "darkgrey" },
    colorGrey: { color: "grey" },
    colorPrimary: { color: platform.brandPrimary },
    colorInfo: { color: platform.brandInfo },
    colorDanger: { color: platform.brandDanger },
    marginLeft0: { marginLeft: 0 },
    marginLeftSmall: { marginLeft: Spacing.small },
    marginLeftNormal: { marginLeft: Spacing.normal },
    marginLeftLarge: { marginLeft: Spacing.large },
    marginRightTiny: { marginRight: Spacing.tiny },
    marginRightSmall: { marginRight: Spacing.small },
    marginRightNormal: { marginRight: Spacing.normal },
    marginRightLarge: { marginRight: Spacing.large },
    marginTopTiny: { marginTop: Spacing.tiny },
    marginTopSmall: { marginTop: Spacing.small },
    marginTopNormal: { marginTop: Spacing.normal },
    marginTopLarge: { marginTop: Spacing.large },
    marginBottom0: { marginBottom: 0 },
    marginBottomTiny: { marginBottom: Spacing.tiny },
    marginBottomSmall: { marginBottom: Spacing.small },
    marginBottomNormal: { marginBottom: Spacing.normal },
    marginBottomLarge: { marginBottom: Spacing.large },
    marginNormal: { margin: Spacing.normal },
    marginLarge: { margin: Spacing.large },
    padding0: { padding: 0 },
    paddingNormal: { padding: Spacing.normal }
});
export default preset;

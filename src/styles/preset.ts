import { StyleSheet } from "react-native";

import platform from "../../native-base-theme/variables/platform";
import { Spacing } from "../constants/dimension";

const preset = StyleSheet.create({
    flex0: { flex: 0 },
    flex1: { flex: 1 },
    flexDirectionRow: { flexDirection: "row" },
    flexDirectionColumn: { flexDirection: "column" },
    flexWrapWrap: { flexWrap: "wrap" },
    justifyContentCenter: { justifyContent: "center" },
    justifyContentFlexEnd: { justifyContent: "flex-end" },
    alignItemsCenter: { alignItems: "center" },
    alignItemsFlexEnd: { alignItems: "flex-end" },
    fontSize14: { fontSize: 14 },
    fontSize16: { fontSize: 16 },
    fontSize20: { fontSize: 20 },
    fontSize24: { fontSize: 24 },
    fontSize32: { fontSize: 32 },
    fontSize36: { fontSize: 36 },
    fontSize48: { fontSize: 48 },
    fontWeightBold: { fontWeight: "bold" },
    alignCenter: { alignSelf: "center" },
    alignFlexEnd: { alignSelf: "flex-end" },
    textAlignCenter: { textAlign: "center" },
    textAlignRight: { textAlign: "right" },
    colorLightGrey: { color: "lightgrey" },
    colorDarkGrey: { color: "darkgrey" },
    colorGrey: { color: "grey" },
    colorPrimary: { color: platform.brandPrimary },
    colorInfo: { color: platform.brandInfo },
    colorDanger: { color: platform.brandDanger },
    colorCaution: { color: platform.brandWarning },
    colorSafe: { color: platform.brandSuccess },
    colorDark: { color: platform.brandDark },
    colorLight: { color: platform.brandLight },
    marginLeft0: { marginLeft: 0 },
    marginLeftTiny: { marginLeft: Spacing.tiny },
    marginLeftSmall: { marginLeft: Spacing.small },
    marginLeftNormal: { marginLeft: Spacing.normal },
    marginLeftLarge: { marginLeft: Spacing.large },
    marginLeftHuge: { marginLeft: Spacing.huge },
    marginRightTiny: { marginRight: Spacing.tiny },
    marginRightSmall: { marginRight: Spacing.small },
    marginRightNormal: { marginRight: Spacing.normal },
    marginRightLarge: { marginRight: Spacing.large },
    marginRightHuge: { marginRight: Spacing.huge },
    marginTop0: { marginTop: 0 },
    marginTopTiny: { marginTop: Spacing.tiny },
    marginTopSmall: { marginTop: Spacing.small },
    marginTopNormal: { marginTop: Spacing.normal },
    marginTopLarge: { marginTop: Spacing.large },
    marginTopHuge: { marginTop: Spacing.huge },
    marginBottom0: { marginBottom: 0 },
    marginBottomTiny: { marginBottom: Spacing.tiny },
    marginBottomSmall: { marginBottom: Spacing.small },
    marginBottomNormal: { marginBottom: Spacing.normal },
    marginBottomLarge: { marginBottom: Spacing.large },
    marginBottomHuge: { marginBottom: Spacing.huge },
    marginTiny: { margin: Spacing.tiny },
    marginSmall: { margin: Spacing.small },
    marginNormal: { margin: Spacing.normal },
    marginLarge: { margin: Spacing.large },
    padding0: { padding: 0 },
    paddingTiny: { padding: Spacing.tiny },
    paddingSmall: { padding: Spacing.small },
    paddingNormal: { padding: Spacing.normal },
    paddingLarge: { padding: Spacing.large }
});
export default preset;

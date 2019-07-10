import React from "react";
import { Chip } from "react-native-paper";

import platform from "../../native-base-theme/variables/platform";
import preset from "../styles/preset";

interface MnemonicChipProps {
    word: string;
    onClose?: () => void;
}

const MnemonicChip = ({ word, onClose }: MnemonicChipProps) => (
    <Chip
        mode="outlined"
        textStyle={[preset.fontSize20, preset.colorInfo]}
        onClose={onClose}
        style={[{ borderColor: platform.brandInfo, borderWidth: 1 }, preset.paddingTiny, preset.marginTiny]}>
        {word}
    </Chip>
);

export default MnemonicChip;

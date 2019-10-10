import React from "react";

import { Button, Icon } from "native-base";
import preset from "../../styles/preset";

const RefreshButton = ({ disabled, onPress }) => (
    <Button
        transparent={true}
        rounded={true}
        disabled={disabled}
        onPress={onPress}
        style={[preset.alignFlexEnd, preset.marginRightNormal]}>
        <Icon type={"MaterialIcons"} name={"refresh"} style={preset.fontSize24} />
    </Button>
);
export default RefreshButton;

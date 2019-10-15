import React, { FunctionComponent } from "react";

import { Button, Icon } from "native-base";
import preset from "../../styles/preset";

interface RefreshButtonProps {
    disabled?: boolean;
    onPress: () => void;
}

const RefreshButton: FunctionComponent<RefreshButtonProps> = ({ disabled, onPress }) => (
    <Button
        transparent={true}
        rounded={true}
        disabled={disabled || false}
        onPress={onPress}
        style={[preset.alignFlexEnd, preset.marginRightNormal]}>
        <Icon type={"MaterialIcons"} name={"refresh"} style={preset.fontSize24} />
    </Button>
);
export default RefreshButton;

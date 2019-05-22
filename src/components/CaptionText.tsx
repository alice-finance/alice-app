import React from "react";

import { NativeBase, Text } from "native-base";
import { Spacing } from "../constants/dimension";

interface CaptionTextProps extends NativeBase.Text {
    small?: boolean;
}

const CaptionText: React.FunctionComponent<CaptionTextProps> = props => {
    return (
        <Text
            {...props}
            style={[
                {
                    color: "darkgrey",
                    fontSize: props.small ? 16 : 18,
                    marginHorizontal: Spacing.small + Spacing.normal
                },
                props.style
            ]}
        />
    );
};

export default CaptionText;

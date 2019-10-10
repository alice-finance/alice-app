import React from "react";

import { NativeBase, Text } from "native-base";
import { Spacing } from "../../constants/dimension";

interface HeadlineTextProps extends NativeBase.Text {
    aboveText?: boolean;
}

const HeadlineText: React.FunctionComponent<HeadlineTextProps> = props => (
    <Text
        {...props}
        style={[
            {
                fontWeight: "bold",
                fontSize: 20,
                marginHorizontal: Spacing.small + Spacing.normal,
                marginTop: Spacing.normal,
                marginBottom: props.aboveText ? Spacing.small : Spacing.normal
            },
            props.style
        ]}
    />
);

export default HeadlineText;

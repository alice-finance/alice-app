import React from "react";

import { NativeBase, Text } from "native-base";
import { Spacing } from "../../constants/dimension";

interface SubtitleTextProps extends NativeBase.Text {
    aboveText?: boolean;
}

const SubtitleText: React.FunctionComponent<SubtitleTextProps> = props => {
    return (
        <Text
            {...props}
            style={[
                {
                    fontWeight: "600",
                    fontSize: 26,
                    marginHorizontal: Spacing.small + Spacing.normal,
                    marginTop: Spacing.normal,
                    marginBottom: props.aboveText ? Spacing.small : Spacing.normal
                },
                props.style
            ]}
        />
    );
};

export default SubtitleText;

import React from "react";

import { NativeBase, Text } from "native-base";
import { Spacing } from "../../constants/dimension";

interface TitleTextProps extends NativeBase.Text {
    aboveText?: boolean;
}

const TitleText: React.FunctionComponent<TitleTextProps> = props => {
    return (
        <Text
            {...props}
            style={[
                {
                    fontWeight: "bold",
                    fontSize: 32,
                    marginHorizontal: Spacing.small + Spacing.normal,
                    marginTop: Spacing.normal,
                    marginBottom: props.aboveText ? Spacing.small : Spacing.large
                },
                props.style
            ]}
        />
    );
};

export default TitleText;

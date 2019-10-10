import React from "react";
import { TextProps } from "react-native";

import { Text } from "native-base";

const NoteText: React.FunctionComponent<TextProps> = props => {
    return (
        <Text
            {...props}
            style={[
                {
                    color: "grey",
                    fontSize: 14
                },
                props.style
            ]}
        />
    );
};

export default NoteText;

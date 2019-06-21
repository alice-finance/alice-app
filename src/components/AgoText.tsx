import React from "react";
import Moment from "react-moment";

import { Text } from "native-base";

const AgoText = ({ date }: { date: Date }) => (
    <Moment fromNow={true} ago={true} element={Text} style={{ fontSize: 20, textTransform: "capitalize" }}>
        {date.getTime()}
    </Moment>
);

export default AgoText;

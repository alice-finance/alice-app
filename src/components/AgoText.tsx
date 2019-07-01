import React from "react";
import Moment from "react-moment";

import "moment/min/locales";
import { Text } from "native-base";
import i18n from "../i18n";

const AgoText = ({ date }: { date: Date }) => {
    const locale = i18n.languages[0].toLowerCase();
    return (
        <Moment
            locale={locale}
            fromNow={true}
            ago={true}
            element={Text}
            style={{ fontSize: 20, textTransform: "capitalize" }}>
            {date.getTime()}
        </Moment>
    );
};

export default AgoText;

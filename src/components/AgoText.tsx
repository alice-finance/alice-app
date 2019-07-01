import React from "react";
import { useTranslation } from "react-i18next";
import Moment from "react-moment";

import "moment/min/locales";
import { Text } from "native-base";

const AgoText = ({ date }: { date: Date }) => {
    const { i18n } = useTranslation();
    return (
        <Moment
            locale={i18n.language}
            fromNow={true}
            ago={true}
            element={Text}
            style={{ fontSize: 20, textTransform: "capitalize" }}>
            {date.getTime()}
        </Moment>
    );
};

export default AgoText;

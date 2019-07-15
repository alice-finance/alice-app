import React, { useState } from "react";
import Moment from "react-moment";

import { Localization } from "expo";
import "moment/min/locales";
import { Text } from "native-base";

const AgoText = ({ date }: { date: Date }) => {
    const [locale, setLocale] = useState<string>();
    Localization.getLocalizationAsync().then(({ locale: l }) => setLocale(l));
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

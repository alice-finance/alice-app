import React, { useState } from "react";
import Moment from "react-moment";

import * as Localization from "expo-localization";
import "moment/min/locales";
import { Text } from "native-base";

const filterLocale = (locale: string): string => {
    locale = locale.toLowerCase();

    if (locale === "en-us") {
        return "en";
    }

    if (locale.indexOf("-") > 0) {
        return locale.substring(0, locale.indexOf("-"));
    }

    return "en";
};

const MomentText = ({ date, ago = false, note = false }: { date: Date; ago?: boolean; note?: boolean }) => {
    const [locale, setLocale] = useState<string>(() => filterLocale(Localization.locale));
    Localization.getLocalizationAsync().then(({ locale: l }) => setLocale(filterLocale(l)));
    return (
        <Moment
            locale={locale}
            fromNow={true}
            ago={ago}
            element={Text}
            style={note ? { color: "grey", fontSize: 14 } : { fontSize: 20, textTransform: "capitalize" }}>
            {date.getTime()}
        </Moment>
    );
};

export default MomentText;

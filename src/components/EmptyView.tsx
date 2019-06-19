import React from "react";
import { useTranslation } from "react-i18next";

import { Text } from "native-base";
import preset from "../styles/preset";

const EmptyView = ({ text }: { text?: string }) => {
    const { t } = useTranslation("common");
    return (
        <Text style={[preset.marginTopHuge, preset.marginBottomHuge, preset.alignCenter, preset.colorLightGrey]}>
            {text || t("noData")}
        </Text>
    );
};

export default EmptyView;

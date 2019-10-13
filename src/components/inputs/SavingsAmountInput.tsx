import React, { FunctionComponent, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Text } from "native-base";
import { ChainContext } from "../../contexts/ChainContext";
import { SavingsContext } from "../../contexts/SavingsContext";
import useAsyncEffect from "../../hooks/useAsyncEffect";
import preset from "../../styles/preset";
import { formatValue } from "../../utils/big-number-utils";
import AmountInput from "./AmountInput";

interface SavingsAmountInputProps {
    initialAmount?: BigNumber;
    onAmountChanged: (amount: BigNumber | null) => void;
    onAPRChanged?: (apr: BigNumber | null) => void;
    onLoadingStarted?: () => void;
    onLoadingFinished?: () => void;
}

const SavingsAmountInput: FunctionComponent<SavingsAmountInputProps> = props => {
    const { t } = useTranslation("savings");
    const { asset } = useContext(SavingsContext);
    const { aprText, onChangeAmount } = useSavingsAmountInputEffect(props);
    return (
        <View>
            <View style={[preset.flexDirectionRow, preset.alignItemsCenter]}>
                <Text style={preset.fontSize24}>{t("amount")}</Text>
                <AmountInput
                    initialValue={props.initialAmount}
                    asset={asset!}
                    placeholderHidden={true}
                    onChangeAmount={onChangeAmount}
                    style={[preset.flex1, preset.marginLeftNormal, preset.marginRightSmall]}
                />
                <Text style={[preset.fontSize36, preset.colorDarkGrey]}>{asset!.symbol}</Text>
            </View>
            <View style={[preset.flexDirectionRow, preset.alignItemsCenter, preset.marginTopSmall]}>
                <Text style={preset.fontSize24}>{t("apr")}</Text>
                <Text style={[preset.flex1, preset.marginRightSmall, preset.fontSize32, preset.textAlignRight]}>
                    {aprText}
                </Text>
            </View>
        </View>
    );
};

const useSavingsAmountInputEffect = (props: SavingsAmountInputProps) => {
    const { asset } = useContext(SavingsContext);
    const [amount, setAmount] = useState<BigNumber | null>(props.initialAmount || null);
    const [apr, setAPR] = useState<BigNumber>(toBigNumber(0));
    const { loomChain } = useContext(ChainContext);
    const aprText = formatValue(apr.mul(100), asset!.decimals, 2) + " %";
    const onChangeAmount = useCallback(a => {
        setAmount(a);
        props.onAmountChanged(a);
    }, []);
    useAsyncEffect(async () => {
        if (amount) {
            if (props.onLoadingStarted) {
                props.onLoadingStarted();
            }
            const market = loomChain!.getMoneyMarket();
            const aprValue = await market.getExpectedSavingsAPR(amount);
            setAPR(aprValue);
            if (props.onAPRChanged) {
                props.onAPRChanged(aprValue);
            }
            if (props.onLoadingFinished) {
                props.onLoadingFinished();
            }
        }
    }, [amount]);
    return { aprText, onChangeAmount };
};

export default SavingsAmountInput;

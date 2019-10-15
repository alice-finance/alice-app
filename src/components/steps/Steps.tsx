import React, { FunctionComponent } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { Icon, Text, View } from "native-base";
import platform from "../../../native-base-theme/variables/platform";
import preset from "../../styles/preset";

interface StepsProps {
    currentStep: number;
    totalSteps: number;
    labels: string[];
    doneLabel: string;
    style?: StyleProp<ViewStyle>;
}

const Steps: FunctionComponent<StepsProps> = ({ currentStep, totalSteps, labels, doneLabel, style }) => {
    const stepElements = [<Step key={0} index={0} completed={currentStep > 1} current={currentStep === 1} />];
    for (let i = 1; i <= totalSteps; i++) {
        stepElements.push(<Line key={2 * i - 1} completed={currentStep >= i + 1} />);
        stepElements.push(
            <Step
                key={2 * i}
                index={i}
                completed={currentStep > i + 1}
                current={currentStep === i + 1}
                done={i === totalSteps}
            />
        );
    }
    return (
        <View style={[preset.alignItemsCenter, style]}>
            <View style={preset.flexDirectionRow}>{stepElements}</View>
            <View style={preset.flexDirectionRow}>
                {[...labels, doneLabel].map((label, index) => (
                    <Label key={index} text={label} />
                ))}
            </View>
        </View>
    );
};

const Step = ({ index, completed, current, done = false }) => {
    return (
        <View style={[preset.alignItemsCenter, preset.justifyContentCenter, stepStyle(completed, current)]}>
            {completed ? (
                <Icon type={"MaterialIcons"} name={"check"} style={[preset.fontSize14, preset.colorLight]} />
            ) : done ? (
                <Icon
                    type={"MaterialIcons"}
                    name={"star"}
                    style={[preset.fontSize20, current ? preset.colorSuccess : preset.colorLight]}
                />
            ) : (
                <Text style={[preset.fontSize16, preset.fontWeightBold, { color: current ? "black" : "white" }]}>
                    {index + 1}
                </Text>
            )}
        </View>
    );
};

const Line = ({ completed }) => {
    return (
        <View
            style={[
                preset.alignCenter,
                { width: 20, height: 2, backgroundColor: completed ? platform.brandSuccess : "lightgrey" }
            ]}
        />
    );
};

const Label = ({ text }) => (
    <Text style={[preset.marginTopSmall, preset.fontSize14, preset.colorGrey, preset.textAlignCenter, { width: 60 }]}>
        {text}
    </Text>
);

const stepStyle = (completed, current) => {
    const color = platform.brandSuccess;
    return {
        backgroundColor: completed ? color : current ? "white" : "lightgrey",
        borderColor: completed || current ? color : "lightgrey",
        borderWidth: 4,
        width: 40,
        height: 40,
        borderRadius: 20
    };
};

export default Steps;

import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View, ViewProps } from "react-native";

import { wordlists } from "bip39";
import platform from "../../native-base-theme/variables/platform";
import preset from "../styles/preset";
import MnemonicChip from "./MnemonicChip";

const MAX_MNEMONIC = 12;

interface MnemonicInputProps extends ViewProps {
    onChangeMnemonic: (mnemonic: string) => void;
}

const MnemonicInput = (props: MnemonicInputProps) => {
    const { t } = useTranslation("common");
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [error, setError] = useState(false);
    const onSubmit = useCallback(
        text => {
            const words = text
                .trim()
                .split(" ")
                .filter(word => word.length > 0)
                .map(word => word.toLowerCase().replace(/[^a-z ]/, ""));
            const validWords = words.filter(word => wordlists.english.includes(word));
            if (words.length > 0) {
                setMnemonic(prevState => {
                    const newMnemonic = [...prevState, ...validWords];
                    props.onChangeMnemonic(newMnemonic.join(" "));
                    return newMnemonic;
                });
            }
            setError(words.length !== validWords.length);
        },
        [setMnemonic, setError]
    );
    const onBackspace = useCallback(() => {
        setMnemonic(prevState => {
            const newMnemonic = prevState;
            newMnemonic.pop();
            props.onChangeMnemonic(newMnemonic.join(" "));
            return newMnemonic;
        });
    }, [setMnemonic]);
    return (
        <View {...props}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {mnemonic.length > 0 &&
                    mnemonic.map((word, index) => (
                        <MnemonicChip
                            key={index}
                            word={word}
                            onClose={index === mnemonic.length - 1 ? onBackspace : undefined}
                        />
                    ))}
                {mnemonic.length < 12 && (
                    <Input index={mnemonic.length + 1} onSubmit={onSubmit} onBackspace={onBackspace} />
                )}
            </View>
            {error && (
                <Text style={[preset.marginNormal, preset.colorDanger, preset.fontSize16]}>
                    {t("invalidSeedWords")}
                </Text>
            )}
        </View>
    );
};

const Input = ({ index, onSubmit, onBackspace }) => {
    const { t } = useTranslation("common");
    const [text, setText] = useState("");
    const input = useRef<TextInput>(null);
    const onKeyPress = useCallback(
        ({ nativeEvent }) => {
            if (nativeEvent.key === " ") {
                onSubmit(text);
                setText("");
                if (input.current) {
                    input.current.focus();
                }
            } else if (nativeEvent.key === "Backspace") {
                if (text.length === 0) {
                    onBackspace();
                }
            }
        },
        [text, setText, input]
    );
    const onSubmitEditing = useCallback(
        ({ nativeEvent }) => {
            onSubmit(nativeEvent.text);
            setText("");
            if (input.current) {
                input.current.focus();
            }
        },
        [setText, input]
    );
    return (
        <TextInput
            ref={input}
            multiline={false}
            numberOfLines={1}
            autoCapitalize={"none"}
            autoCorrect={false}
            autoFocus={true}
            placeholder={t("seedWordN", { index })}
            returnKeyType={index === MAX_MNEMONIC ? "done" : "next"}
            onKeyPress={onKeyPress}
            onChangeText={setText}
            onSubmitEditing={onSubmitEditing}
            style={[
                { width: 120, borderBottomColor: platform.brandLight, borderBottomWidth: 2 },
                preset.fontSize20,
                preset.marginLeftSmall,
                preset.paddingSmall
            ]}
        />
    );
};

export default MnemonicInput;

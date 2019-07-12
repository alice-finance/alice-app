import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, TextInput, View, ViewProps } from "react-native";

import { wordlists } from "bip39";
import { Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import preset from "../styles/preset";
import MnemonicChip from "./MnemonicChip";

const MAX_MNEMONIC = 12;

const isLetter = char => char.length === 1 && char.match(/[a-z]/i);

interface MnemonicInputProps extends ViewProps {
    onChangeMnemonic: (mnemonic: string) => void;
}

const MnemonicInput = (props: MnemonicInputProps) => {
    const { t } = useTranslation("common");
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [error, setError] = useState(false);
    const onAdd = useCallback(
        (text: string) => {
            const words = text
                .trim()
                .split(" ")
                .filter(word => word.length > 0)
                .map(word => word.toLowerCase().replace(/[^a-z ]/, ""));
            const validWords = words.filter(word => wordlists.english.includes(word));
            if (words.length > 0) {
                setMnemonic([...mnemonic, ...validWords]);
            }
            setError(words.length !== validWords.length);
        },
        [mnemonic, setMnemonic, setError]
    );
    const onRemove = useCallback(() => {
        setMnemonic(mnemonic.slice(0, -1));
    }, [mnemonic, setMnemonic]);
    useEffect(() => {
        props.onChangeMnemonic(mnemonic.join(" "));
    }, [mnemonic]);
    return (
        <View {...props}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {mnemonic.length > 0 &&
                    mnemonic.map((word, index) => (
                        <MnemonicChip
                            key={index}
                            word={word}
                            onClose={index === mnemonic.length - 1 ? onRemove : undefined}
                        />
                    ))}
                {mnemonic.length < 12 && <Input index={mnemonic.length + 1} onAdd={onAdd} onRemove={onRemove} />}
            </View>
            {error && (
                <Text style={[preset.marginNormal, preset.colorDanger, preset.fontSize16]}>
                    {t("invalidSeedWords")}
                </Text>
            )}
        </View>
    );
};

const Input = ({ index, onAdd, onRemove }) => {
    const { t } = useTranslation("common");
    const [text, setText] = useState("");
    const [changeable, setChangeable] = useState(true);
    const input = useRef<TextInput>(null);
    const onKeyPress = useCallback(
        ({ nativeEvent }) => {
            setChangeable(false);
            if (nativeEvent.key === " ") {
                onAdd(text);
                setText("");
                if (input.current) {
                    input.current.focus();
                }
            } else if (nativeEvent.key === "Backspace") {
                if (text.length === 0) {
                    onRemove();
                } else if (Platform.OS === "ios") {
                    setText(text.slice(0, -1));
                }
            } else if (isLetter(nativeEvent.key) && Platform.OS === "ios") {
                setText(text + nativeEvent.key);
            }
        },
        [text, input, onAdd, onRemove]
    );
    const onSubmitEditing = useCallback(
        ({ nativeEvent }) => {
            onAdd(nativeEvent.text);
            setText("");
            setTimeout(() => {
                if (input.current) {
                    input.current.focus();
                }
            }, 50);
        },
        [input, onAdd]
    );
    const onChangeText = useCallback(
        newText => {
            if (Platform.OS === "ios") {
                if (changeable) {
                    setText(newText);
                }
                setChangeable(true);
            } else {
                setText(newText);
            }
        },
        [changeable, setChangeable]
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
            blurOnSubmit={false}
            onKeyPress={onKeyPress}
            value={text}
            onChangeText={onChangeText}
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

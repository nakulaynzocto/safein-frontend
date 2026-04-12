"use client";

import { InputField, type InputFieldProps } from "./inputField";

export const MASKED_DISPLAY_VALUE = "••••••••";

interface MaskedInputFieldProps extends Omit<InputFieldProps, "type"> {
    // Allows overriding the masked behavior if needed in the future
    isMaskedInApi?: boolean;
}

/**
 * A specialized InputField for sensitive data (API keys, tokens, etc.)
 * It utilizes the base InputField's built-in password toggle behavior
 * and adds logic to handle the "MASKED_DISPLAY_VALUE" placeholder.
 */
export function MaskedInputField({
    isMaskedInApi = true,
    value,
    helperText,
    ...props
}: MaskedInputFieldProps) {
    const isMaskedValue = value === MASKED_DISPLAY_VALUE;
    
    return (
        <InputField
            {...props}
            value={value}
            type="password"
            helperText={
                helperText || 
                (isMaskedValue ? "Leave unchanged to keep current value" : "")
            }
        />
    );
}


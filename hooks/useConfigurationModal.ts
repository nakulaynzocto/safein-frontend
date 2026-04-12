import { useState, useCallback, useMemo } from "react";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

export type ConfigWarningType = "smtp" | "whatsapp" | "both" | null;

export function useConfigurationModal() {
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);
    
    const { data: settings, isSuccess: settingsReady, isFetching: settingsFetching } = useGetSettingsQuery(undefined, {
        skip: !user?.id || isEmployee,
    });

    const [configWarning, setConfigWarning] = useState<ConfigWarningType>(null);

    const smtpOk = useMemo(() => Boolean(settings?.smtp?.verified), [settings]);
    const whatsappOk = useMemo(() => Boolean(settings?.whatsapp?.verified || settings?.whatsapp?.metaVerified), [settings]);
    const hasAnyDeliveryChannel = smtpOk || whatsappOk;

    const openConfigModal = useCallback((type: ConfigWarningType) => {
        setConfigWarning(type);
    }, []);

    const closeConfigModal = useCallback(() => {
        setConfigWarning(null);
    }, []);

    const checkConfiguration = useCallback((channel: "email" | "phone" | "any") => {
        if (isEmployee) return true; // Employees don't need to configure
        if (!settingsReady) return true; // Assume ok while loading or handle separately

        if (channel === "any" && !hasAnyDeliveryChannel) {
            openConfigModal("both");
            return false;
        }
        if (channel === "email" && !smtpOk) {
            openConfigModal("smtp");
            return false;
        }
        if (channel === "phone" && !whatsappOk) {
            openConfigModal("whatsapp");
            return false;
        }
        return true;
    }, [isEmployee, settingsReady, hasAnyDeliveryChannel, smtpOk, whatsappOk, openConfigModal]);

    return {
        configWarning,
        openConfigModal,
        closeConfigModal,
        isOpen: configWarning !== null,
        smtpOk,
        whatsappOk,
        hasAnyDeliveryChannel,
        settingsReady,
        settingsFetching,
        checkConfiguration,
    };
}

"use client";

import { VoiceCallSettings } from "@/components/settings/VoiceCallSettings";
import { useGetWalletBalanceQuery } from "@/store/api/walletApi";

export default function VoiceSettingsPage() {
    const { data: walletData } = useGetWalletBalanceQuery();
    
    return <VoiceCallSettings walletData={walletData} />;
}

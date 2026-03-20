"use client";

import React, { useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { SelectField } from "@/components/common/selectField";
import { InputField } from "@/components/common/inputField";

export interface CountryStateCityValue {
    country: string;
    state: string;
    city: string;
}

interface Props {
    value: CountryStateCityValue;
    onChange: (v: CountryStateCityValue) => void;
    errors?: Partial<Record<keyof CountryStateCityValue, string>>;
    required?: boolean;
}

export function CountryStateCitySelect({ value, onChange, errors, required = false }: Props) {
    const countries = useMemo(() =>
        Country.getAllCountries().map((c) => ({
            label: c.name,
            value: c.isoCode,
            searchKeywords: `${c.name} ${c.isoCode} ${c.phonecode ?? ""}`.trim(),
        })), []
    );

    const states = useMemo(() =>
        value.country
            ? State.getStatesOfCountry(value.country).map((s) => ({
                label: s.name,
                value: s.isoCode,
                searchKeywords: `${s.name} ${s.isoCode}`.trim(),
            }))
            : [],
        [value.country]
    );

    const cities = useMemo(() =>
        value.country && value.state
            ? City.getCitiesOfState(value.country, value.state).map((ct) => ({
                label: ct.name,
                value: ct.name,
            }))
            : [],
        [value.country, value.state]
    );

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
                label="Country"
                placeholder="Select country"
                options={countries}
                value={value.country}
                onChange={(country) => onChange({ ...value, country, state: "", city: "" })}
                error={errors?.country}
                required={required}
            />
            <SelectField
                label="State"
                placeholder="Select state"
                options={states}
                value={value.state}
                onChange={(state) => onChange({ ...value, state, city: "" })}
                isDisabled={!value.country}
                error={errors?.state}
                required={required}
            />
            <SelectField
                label="City"
                placeholder="Select city"
                options={cities}
                value={value.city}
                onChange={(city) => onChange({ ...value, city })}
                isDisabled={!value.country || !value.state}
                error={errors?.city}
                required={required}
            />
        </div>
    );
}

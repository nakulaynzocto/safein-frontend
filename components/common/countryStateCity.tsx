"use client";

import React from "react";
import { Country, State, City } from "country-state-city";
import { SelectField } from "@/components/common/selectField";

export interface CountryStateCityValue {
    country: string;
    state: string;
    city: string;
}

interface Props {
    value: CountryStateCityValue;
    onChange: (v: CountryStateCityValue) => void;
    errors?: Partial<Record<keyof CountryStateCityValue, string>>;
}

export function CountryStateCitySelect({ value, onChange, errors }: Props) {
    const countries = Country.getAllCountries().map((c) => ({
        label: c.name,
        value: c.isoCode,
        searchKeywords: `${c.name} ${c.isoCode} ${c.phonecode ?? ""}`.trim(),
    }));
    const states = value.country
        ? State.getStatesOfCountry(value.country).map((s) => ({
              label: s.name,
              value: s.isoCode,
              searchKeywords: `${s.name} ${s.isoCode}`.trim(),
          }))
        : [];
    const cities =
        value.country && value.state
            ? City.getCitiesOfState(value.country, value.state).map((ct) => ({
                  label: ct.name,
                  value: ct.name,
              }))
            : [];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectField
                label="Country"
                placeholder="Select country"
                options={countries}
                value={value.country}
                onChange={(country) => onChange({ country, state: "", city: "" })}
                error={errors?.country}
                required
            />
            <SelectField
                label="State"
                placeholder="Select state"
                options={states}
                value={value.state}
                onChange={(state) => onChange({ ...value, state, city: "" })}
                isDisabled={!value.country}
                error={errors?.state}
                required
            />
            <SelectField
                label="City"
                placeholder="Select city"
                options={cities}
                value={value.city}
                onChange={(city) => onChange({ ...value, city })}
                isDisabled={!value.country || !value.state}
                error={errors?.city}
                required
            />
        </div>
    );
}

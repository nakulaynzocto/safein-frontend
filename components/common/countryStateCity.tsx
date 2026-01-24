"use client"

import React from "react"
import { Country, State, City } from "country-state-city"
import { SelectField } from "@/components/common/selectField"
import { te } from "date-fns/locale"

export interface CountryStateCityValue {
  country: string
  state: string
  city: string
  testId?: string 
}

interface Props {
  value: CountryStateCityValue
  onChange: (v: CountryStateCityValue) => void
  errors?: Partial<Record<keyof CountryStateCityValue, string>>
  testIds?: {
    country?: string
    state?: string
    city?: string
  }
}

export function CountryStateCitySelect({ value, onChange, errors,testIds }: Props) {
  const countries = Country.getAllCountries().map(c => ({ 
    label: c.name, 
    value: c.isoCode,
    searchKeywords: `${c.name} ${c.isoCode} ${c.phonecode ?? ""}`.trim(),
    
  }))
  const states = value.country ? State.getStatesOfCountry(value.country).map(s => ({ 
    label: s.name, 
    value: s.isoCode,
    searchKeywords: `${s.name} ${s.isoCode}`.trim(),
    
  })) : []
  const cities = value.country && value.state ? City.getCitiesOfState(value.country, value.state).map(ct => ({ 
    label: ct.name, 
    value: ct.name,
    testId: `city-select-${ct.name}`
  })) : []

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SelectField
        label="Country"
        testId={testIds?.country}
        placeholder="Select country"
        options={countries}
        value={value.country}
        onChange={(country) => onChange({ country, state: "", city: "" })}
        error={errors?.country}
        required
      />
      <SelectField
        label="State"
        testId={testIds?.state}
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
        testId={testIds?.city}
        placeholder="Select city"
        options={cities}
        value={value.city}
        onChange={(city) => onChange({ ...value, city })}
        isDisabled={!value.country || !value.state}
        error={errors?.city}
        required
      />
    </div>
  )
}





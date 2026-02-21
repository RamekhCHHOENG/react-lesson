/**
 * PersonalInfoSection — Stateless Section Component
 * Renders: First Name, Last Name, Gender, DOB, Phone, Email, Address, Disability
 * All state owned by parent → passed via props (controlled component pattern)
 */
import React from "react";
import PropTypes from "prop-types";
import InputField from "./InputField";
import SelectField from "./SelectField";
import DateField from "./DateField";
import CheckboxField from "./CheckboxField";
import type { PersonalInfoSectionProps } from "../types";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  onFieldChange,
}) => {
  return (
    <section className="reg__section">
      <h3 className="reg__section-title">Personal Information</h3>

      <div className="reg__row">
        <div className="reg__col">
          <label className="reg__label">First Name</label>
          <InputField
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(v) => onFieldChange("firstName", v)}
          />
        </div>
        <div className="reg__col">
          <label className="reg__label">Last Name</label>
          <InputField
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(v) => onFieldChange("lastName", v)}
          />
        </div>
      </div>

      <div className="reg__row">
        <div className="reg__col">
          <label className="reg__label">Gender</label>
          <SelectField
            name="gender"
            placeholder="Choose..."
            value={formData.gender}
            onChange={(v) => onFieldChange("gender", v)}
            options={genderOptions}
          />
        </div>
        <div className="reg__col">
          <label className="reg__label">Date of Birth</label>
          <DateField
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(v) => onFieldChange("dateOfBirth", v)}
          />
        </div>
      </div>

      <div className="reg__row">
        <div className="reg__col">
          <label className="reg__label">Phone</label>
          <InputField
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={(v) => onFieldChange("phone", v)}
          />
        </div>
        <div className="reg__col">
          <label className="reg__label">Email</label>
          <InputField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(v) => onFieldChange("email", v)}
          />
        </div>
      </div>

      <div className="reg__row">
        <div className="reg__col reg__col--full">
          <label className="reg__label">Address</label>
          <InputField
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={(v) => onFieldChange("address", v)}
          />
        </div>
      </div>

      <div className="reg__row">
        <div className="reg__col reg__col--full">
          <CheckboxField
            name="isDisabled"
            label="Disability"
            checked={formData.isDisabled}
            onChange={(v) => onFieldChange("isDisabled", v)}
          />
          {formData.isDisabled && (
            <div className="reg__disability-input">
              <InputField
                type="text"
                name="disability"
                placeholder="Please specify disability"
                value={formData.disability}
                onChange={(v) => onFieldChange("disability", v)}
                required={false}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

PersonalInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default PersonalInfoSection;

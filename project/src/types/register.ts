/**
 * ============================================================
 * TYPES — Registration Form (Signup for Free)
 * ============================================================
 * Matches the exercise screenshot state shape:
 *   subjects, firstName, lastName, gender, dateOfBirth,
 *   phone, email, address, isDisabled, disability,
 *   workingExperienceYear, workingExperienceField,
 *   interest, cvUrl
 * ============================================================
 */

/* ── Education row ── */
export interface SubjectEntry {
  id: number;
  subject: string;
  schoolName: string;
  year: string;
}

/* ── Full form state (matches exercise screenshot) ── */
export interface RegisterFormData {
  subjects: SubjectEntry[];
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  isDisabled: boolean;
  disability: string;
  workingExperienceYear: string;
  workingExperienceField: string;
  interest: string;
  cvUrl: string;
}

/* ── Section component props ── */
export interface PersonalInfoSectionProps {
  formData: RegisterFormData;
  onFieldChange: (field: keyof RegisterFormData, value: string | boolean) => void;
}

export interface EducationSectionProps {
  subjects: SubjectEntry[];
  onSubjectChange: (id: number, field: keyof SubjectEntry, value: string) => void;
  onAddSubject: () => void;
  onRemoveSubject: (id: number) => void;
}

export interface WorkExperienceSectionProps {
  experienceYear: string;
  experienceField: string;
  onFieldChange: (field: keyof RegisterFormData, value: string) => void;
}

export interface OtherInfoSectionProps {
  interest: string;
  cvUrl: string;
  onFieldChange: (field: keyof RegisterFormData, value: string) => void;
  onFileChange: (file: File | null) => void;
}

/* ── Checkbox props ── */
export interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
}

/* ── DateField props ── */
export interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
  required?: boolean;
}

/* ── TextArea props ── */
export interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

/* ── FileField props ── */
export interface FileFieldProps {
  onFileChange: (file: File | null) => void;
  fileName: string;
  accept?: string;
}

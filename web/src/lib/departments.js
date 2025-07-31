export const DEPARTMENTS = [
  'Human Resources',
  'Information Technology',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Service',
  'Legal',
  'Research & Development',
  'Administration',
  'Procurement',
  'Quality Assurance',
  'Production',
  'Logistics',
  'Business Development'
]

export const getDepartmentOptions = () => {
  return DEPARTMENTS.map(dept => ({
    value: dept,
    label: dept
  }))
}

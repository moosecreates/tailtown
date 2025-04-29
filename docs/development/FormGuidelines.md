# Form Guidelines for Tailtown

This document outlines the best practices and standards for creating forms in the Tailtown application. Following these guidelines will ensure consistency across the application and provide a better user experience.

## Form Field Standards

### Material UI Select Components

When using Material UI Select components, follow these guidelines to ensure proper label positioning and consistent behavior:

```tsx
<FormControl fullWidth size="small" sx={{ mb: 1 }}>
  <InputLabel id="field-label" shrink={true}>Field Label</InputLabel>
  <Select
    labelId="field-label"
    id="field-select"
    value={value}
    label="Field Label"
    onChange={handleChange}
    required
    displayEmpty
    notched
    // Add proper ARIA attributes for accessibility
    inputProps={{
      'aria-label': 'Select a field',
      'aria-hidden': 'false'
    }}
  >
    <MenuItem value="" disabled>Select a field</MenuItem>
    {options.map((option) => (
      <MenuItem key={option.id} value={option.id}>
        {option.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
```

### Key Properties to Include

1. **InputLabel Component**:
   - Always use `shrink={true}` to ensure the label is positioned above the field
   - Connect to the Select component using the `labelId` attribute

2. **Select Component**:
   - Include `notched` property to ensure proper spacing for the label
   - Use `displayEmpty` to show placeholder text when no value is selected
   - Include `label` property that matches the InputLabel text
   - Connect to the InputLabel using the `labelId` attribute

3. **Accessibility**:
   - Add proper ARIA attributes using the `inputProps` property
   - Include descriptive `aria-label` for screen readers

## Handling Form Values

### Loading Initial Values

When loading initial values for form fields, ensure that options are loaded before setting values:

```tsx
// Mark that options are available when they are loaded
selectsWithOptions.current.fieldName = optionsArray.length > 0;

// Only set the value if options are available
value={selectsWithOptions.current.fieldName ? (selectedValue || "") : ""}
```

### Auto-Selection

For better user experience, implement auto-selection when appropriate:

```tsx
// Auto-select when there's only one option
if (options.length === 1) {
  setSelectedValue(options[0].id);
}
```

## Form Validation

Implement proper form validation before submission:

```tsx
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setError('');

  // Validate all required fields
  if (!requiredField1 || !requiredField2) {
    setError('Please fill in all required fields');
    return;
  }

  // Proceed with form submission
  try {
    await onSubmit(formData);
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to submit form';
    setError(errorMessage);
  }
};
```

## Error Handling

Display errors in a consistent manner:

```tsx
{error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
```

By following these guidelines, we ensure that all forms in the Tailtown application have a consistent look and feel, proper accessibility, and a smooth user experience.

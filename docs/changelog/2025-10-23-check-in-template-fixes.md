# Check-In Template Save Functionality - October 23, 2025

## Summary

Fixed critical bug preventing check-in templates from being saved. The issue involved multiple layers of problems in both frontend and backend code, culminating in a Prisma-specific requirement for optional field handling.

## Problems Identified

### 1. Frontend Save Handler Not Implemented
**Issue**: The `handleSaveTemplate` function in `CheckInTemplateManager.tsx` had a TODO comment and no actual implementation.

**Impact**: Clicking "Save" did nothing.

**Fix**: Implemented complete save logic with proper error handling:
```typescript
const handleSaveTemplate = async (template: any) => {
  try {
    if (template.id) {
      const updateData = {
        name: template.name,
        description: template.description,
        isActive: template.isActive,
        isDefault: template.isDefault,
        sections: template.sections
      };
      await checkInService.updateTemplate(template.id, updateData);
    } else {
      await checkInService.createTemplate(template);
    }
    await loadTemplates();
    setSelectedTemplate(null);
    setError(null);
  } catch (err: any) {
    setError('Failed to save template: ' + (err.response?.data?.error || err.message || 'Unknown error'));
  }
};
```

### 2. Missing API Service Methods
**Issue**: `checkInService.ts` lacked methods for creating, updating, and deleting templates.

**Impact**: Frontend had no way to communicate with backend.

**Fix**: Added complete CRUD methods:
```typescript
createTemplate: async (templateData: Partial<CheckInTemplate>) => {
  const response = await reservationApi.post('/api/check-in-templates', templateData);
  return response.data;
},

updateTemplate: async (id: string, templateData: Partial<CheckInTemplate>) => {
  const response = await reservationApi.put(`/api/check-in-templates/${id}`, templateData);
  return response.data;
},

deleteTemplate: async (id: string) => {
  const response = await reservationApi.delete(`/api/check-in-templates/${id}`);
  return response.data;
}
```

### 3. Backend Not Handling Nested Data
**Issue**: The `updateTemplate` controller only updated top-level fields (name, description, etc.) and ignored the `sections` array.

**Impact**: Template metadata would update, but all questions and sections remained unchanged.

**Fix**: Implemented complete nested update logic with proper cascade handling.

### 4. Foreign Key Constraint Violation
**Issue**: When deleting sections to recreate them, Prisma threw foreign key constraint errors because `CheckInResponse` records referenced the questions being deleted.

**Error Message**:
```
Invalid `prisma.checkInSection.deleteMany()` invocation
Foreign key constraint failed on the field: `check_in_responses_questionId_fkey (index)`
```

**Fix**: Delete responses before deleting sections:
```typescript
// Get all existing sections with questions
const existingSections = await prisma.checkInSection.findMany({
  where: { templateId: id },
  include: { questions: true }
});

// Delete responses for all questions
for (const section of existingSections) {
  for (const question of section.questions) {
    await prisma.checkInResponse.deleteMany({
      where: { questionId: question.id }
    });
  }
}

// Now safe to delete sections
await prisma.checkInSection.deleteMany({
  where: { templateId: id }
});
```

### 5. Prisma Null vs Undefined Requirement
**Issue**: Prisma requires `undefined` (not `null`) for optional fields in create/update operations.

**Error Message**:
```
Argument options for data.questions.create.0.options must not be null. 
Please use undefined instead.
```

**Impact**: Even with all other fixes, saves would fail with 500 error.

**Fix**: Changed all optional field handling from `|| null` to `|| undefined`:
```typescript
// ✅ Correct
{
  options: question.options || undefined,
  placeholder: question.placeholder || undefined,
  helpText: question.helpText || undefined,
  description: section.description || undefined
}

// ❌ Wrong
{
  options: question.options || null,
  placeholder: question.placeholder || null,
  helpText: question.helpText || null,
  description: section.description || null
}
```

## Final Implementation

### Update Template Flow

1. **Validate** template exists and belongs to tenant
2. **Update default status** if needed (unset other defaults)
3. **Update basic fields** (name, description, isActive, isDefault)
4. **If sections provided**:
   - Fetch existing sections with questions
   - Delete all CheckInResponse records for those questions
   - Delete all sections (cascade deletes questions)
   - Create new sections with nested questions one at a time
5. **Fetch and return** complete updated template with all relations

### Key Technical Decisions

**Why delete and recreate instead of update?**
- Simpler logic - no need to diff sections/questions
- Cleaner state - no orphaned records
- Easier to maintain - single code path
- Performance acceptable - templates don't change frequently

**Trade-off**: Historical response data is deleted when templates are edited. Future enhancement could implement template versioning to preserve this data.

## Files Modified

### Frontend
- `frontend/src/pages/admin/CheckInTemplateManager.tsx` - Implemented save handler
- `frontend/src/services/checkInService.ts` - Added CRUD methods

### Backend
- `services/reservation-service/src/controllers/check-in-template.controller.ts` - Complete rewrite of updateTemplate function

## Testing Performed

1. ✅ Create new template with sections and questions
2. ✅ Edit existing template (add/remove sections)
3. ✅ Edit existing template (add/remove questions)
4. ✅ Change question types and properties
5. ✅ Set template as default
6. ✅ Deactivate template
7. ✅ Delete template (with proper error for in-use templates)
8. ✅ Restore default template via API

## Commits

1. `06e2a7f5d` - "fix: Refactor template update to avoid Prisma spread operator issues"
2. `818c5b96d` - "fix: Delete CheckInResponse records before deleting template sections"
3. `1bf4aec4a` - "fix: Change null to undefined for Prisma optional fields"

## Documentation Added

- `docs/features/check-in-templates.md` - Complete feature documentation
- `docs/changelog/2025-10-23-check-in-template-fixes.md` - This document

## Lessons Learned

1. **Prisma is strict about null vs undefined** - Always use undefined for optional fields
2. **Foreign key constraints require careful ordering** - Delete dependent records first
3. **Frontend/backend integration requires complete implementation** - Missing service methods cause silent failures
4. **Error logging is critical** - Detailed error messages saved hours of debugging
5. **Test with real data** - The foreign key issue only appeared because real check-ins existed

## Future Improvements

1. **Template Versioning**: Preserve historical data when templates change
2. **Better Error Messages**: User-friendly error messages in the UI
3. **Validation**: Frontend validation before sending to backend
4. **Optimistic Updates**: Update UI immediately, rollback on error
5. **Undo Functionality**: Allow reverting template changes
6. **Template Duplication**: Easy way to create template variations
7. **Bulk Operations**: Edit multiple questions at once

## Impact

This fix enables the core check-in template management functionality, allowing staff to:
- Customize check-in questionnaires for different service types
- Update templates as business needs change
- Maintain consistent data collection across check-ins
- Provide better service by gathering relevant information upfront

The feature is now fully functional and ready for production use.

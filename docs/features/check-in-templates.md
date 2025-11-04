# Check-In Templates

## Overview

Check-in templates allow you to create customizable questionnaires for pet boarding check-ins. Templates consist of sections with questions that collect important information about pets, their care requirements, and emergency contacts.

## Features

- **Template Management**: Create, edit, and delete check-in templates
- **Section Organization**: Group related questions into logical sections
- **Multiple Question Types**: Support for various input types
- **Default Template**: Set one template as the default for all check-ins
- **Active/Inactive Status**: Control which templates are available for use
- **Reusable Templates**: Use the same template across multiple check-ins

## Question Types

The following question types are supported:

- **TEXT**: Single-line text input
- **LONG_TEXT**: Multi-line text area for longer responses
- **YES_NO**: Simple yes/no toggle
- **MULTIPLE_CHOICE**: Select from predefined options
- **TIME**: Time picker for scheduling information
- **DATE**: Date picker for date-specific information

## Template Structure

### Template Fields
- **Name**: Template identifier (e.g., "Standard Boarding Check-In")
- **Description**: Brief explanation of the template's purpose
- **Is Active**: Whether the template is available for use
- **Is Default**: Whether this is the default template for new check-ins

### Section Fields
- **Title**: Section name (e.g., "Contact Information")
- **Description**: Optional explanation of the section
- **Order**: Display order of sections

### Question Fields
- **Question Text**: The question to display
- **Question Type**: Type of input (see Question Types above)
- **Is Required**: Whether the question must be answered
- **Order**: Display order within the section
- **Placeholder**: Optional placeholder text for text inputs
- **Help Text**: Optional additional context or instructions
- **Options**: For MULTIPLE_CHOICE questions, the available choices

## Using Templates

### Admin Interface

Navigate to **Admin → Check-In Templates** to manage templates.

#### Creating a Template

1. Click "Create New Template"
2. Fill in template name and description
3. Toggle "Active" and "Default" as needed
4. Add sections by clicking "Add Section"
5. For each section:
   - Enter section title and description
   - Add questions by clicking "Add Question"
   - Configure each question's properties
6. Click "Save Template"

#### Editing a Template

1. Select a template from the list
2. Make your changes to sections and questions
3. Click "Save Template"

**Note**: Editing a template will delete existing check-in responses associated with that template. This is necessary to maintain data consistency.

#### Deleting a Template

Templates that are in use by existing check-ins cannot be deleted. Instead, deactivate them by toggling the "Active" status.

### API Usage

#### Get All Templates

```http
GET /api/check-in-templates
Headers:
  x-tenant-id: dev
```

#### Get Single Template

```http
GET /api/check-in-templates/:id
Headers:
  x-tenant-id: dev
```

#### Create Template

```http
POST /api/check-in-templates
Headers:
  x-tenant-id: dev
  Content-Type: application/json

Body:
{
  "name": "Template Name",
  "description": "Template description",
  "isActive": true,
  "isDefault": false,
  "sections": [
    {
      "title": "Section Title",
      "description": "Section description",
      "order": 1,
      "questions": [
        {
          "questionText": "Question text?",
          "questionType": "TEXT",
          "isRequired": true,
          "order": 1,
          "placeholder": "Enter text here",
          "helpText": "Additional help text"
        }
      ]
    }
  ]
}
```

#### Update Template

```http
PUT /api/check-in-templates/:id
Headers:
  x-tenant-id: dev
  Content-Type: application/json

Body:
{
  "name": "Updated Template Name",
  "description": "Updated description",
  "isActive": true,
  "isDefault": true,
  "sections": [...]
}
```

**Important**: When updating a template, all existing sections and questions are deleted and recreated. This ensures data consistency but will delete historical response data.

#### Delete Template

```http
DELETE /api/check-in-templates/:id
Headers:
  x-tenant-id: dev
```

Templates in use by existing check-ins cannot be deleted.

## Technical Implementation

### Database Schema

```prisma
model CheckInTemplate {
  id          String            @id @default(uuid())
  tenantId    String
  name        String
  description String?
  isActive    Boolean           @default(true)
  isDefault   Boolean           @default(false)
  sections    CheckInSection[]
  checkIns    CheckIn[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model CheckInSection {
  id          String            @id @default(uuid())
  templateId  String
  title       String
  description String?
  order       Int
  questions   CheckInQuestion[]
  template    CheckInTemplate   @relation(fields: [templateId], references: [id], onDelete: Cascade)
}

model CheckInQuestion {
  id           String            @id @default(uuid())
  sectionId    String
  questionText String
  questionType String
  options      Json?
  isRequired   Boolean           @default(false)
  order        Int
  placeholder  String?
  helpText     String?
  responses    CheckInResponse[]
  section      CheckInSection    @relation(fields: [sectionId], references: [id], onDelete: Cascade)
}

model CheckInResponse {
  id         String          @id @default(uuid())
  checkInId  String
  questionId String
  response   Json
  checkIn    CheckIn         @relation(fields: [checkInId], references: [id], onDelete: Cascade)
  question   CheckInQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
}
```

### Key Implementation Details

#### Prisma Optional Fields

When creating or updating templates, use `undefined` instead of `null` for optional fields:

```typescript
// ✅ Correct
{
  options: question.options || undefined,
  placeholder: question.placeholder || undefined,
  helpText: question.helpText || undefined
}

// ❌ Wrong - Prisma will throw error
{
  options: question.options || null,
  placeholder: question.placeholder || null,
  helpText: question.helpText || null
}
```

#### Update Strategy

The update operation follows this sequence:

1. Update basic template fields (name, description, isActive, isDefault)
2. Fetch all existing sections with their questions
3. Delete all CheckInResponse records for those questions
4. Delete all sections (cascade deletes questions)
5. Create new sections with nested questions
6. Return the updated template with all relations

This approach ensures:
- No orphaned records in the database
- No foreign key constraint violations
- Clean state for the updated template

#### Cascade Deletes

The schema uses `onDelete: Cascade` to automatically clean up related records:
- Deleting a template deletes its sections
- Deleting a section deletes its questions
- Deleting a question deletes its responses

### Frontend Components

- **CheckInTemplateManager**: Main management interface
- **TemplateEditor**: Form for creating/editing templates
- **TemplateList**: Display list of available templates

### Services

- **checkInService**: Frontend API client for template operations
- **check-in-template.controller**: Backend controller handling template CRUD

## Default Template

The system includes a default "Standard Boarding Check-In" template with three sections:

### 1. Contact Information
- Emergency Contact Name
- Emergency Contact Phone
- Relationship to Pet Owner
- Will you be reachable during your pet's stay?
- Best way to contact you

### 2. Feeding Schedule
- Morning feeding time
- Evening feeding time
- Food amount per meal
- Does your pet get food toppers or supplements?
- May we use appetite incentives if needed?
- May we add probiotics to meals if needed?

### 3. Medical & Behavioral
- Any medical conditions we should be aware of?
- Any behavioral concerns?
- Is your pet comfortable with other dogs?

## Troubleshooting

### Template Won't Save

**Issue**: 500 error when saving template

**Solutions**:
1. Check that optional fields use `undefined` not `null`
2. Verify all required fields are present
3. Check backend logs for Prisma errors
4. Ensure question types are valid

### Template Won't Delete

**Issue**: Cannot delete template

**Solution**: Template is in use by existing check-ins. Deactivate it instead by setting `isActive: false`.

### Missing Sections After Edit

**Issue**: Sections disappear after editing

**Solution**: This is expected behavior. When updating a template, all sections are deleted and recreated. Ensure you're sending the complete template structure in the update request.

## Best Practices

1. **Always include all sections** when updating a template
2. **Use descriptive names** for templates, sections, and questions
3. **Set appropriate question types** to ensure proper data validation
4. **Use help text** to provide context for complex questions
5. **Test templates** before setting as default
6. **Deactivate instead of delete** templates that are in use
7. **Keep questions focused** - one piece of information per question
8. **Order logically** - group related questions in sections

## Future Enhancements

Potential improvements for the check-in template system:

- Template versioning to preserve historical data
- Template duplication for creating variations
- Conditional questions based on previous answers
- Template preview mode
- Import/export templates
- Template analytics (completion rates, common responses)
- Custom validation rules for questions
- File upload question type
- Signature question type for agreements

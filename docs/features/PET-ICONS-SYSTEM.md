# Pet Icons System

**Last Updated**: November 5, 2025  
**Version**: 2.0

---

## Overview

The Pet Icons System provides a visual shorthand for staff to quickly identify important characteristics, behaviors, and requirements for each pet. Icons are organized into categories and include descriptive tooltips for clarity.

---

## Icon Categories

### 1. Group Compatibility

Indicates how well a pet interacts with other animals in group settings.

| Icon | ID | Label | Description |
|------|-----|-------|-------------|
| 🟢 | `small-group` | Small Group | Compatible with small groups of similar pets |
| 🟠 | `medium-group` | Medium Group | Can be in medium-sized playgroups with supervision |
| 🔵 | `large-group` | Large Group | Thrives in large playgroups |
| ⚪ | `solo-only` | Solo Only | Must be kept separate from other animals |

### 2. Size

Indicates the pet's size category.

| Icon | ID | Label | Description |
|------|-----|-------|-------------|
| 🐕‍🦺 | `small-size` | Small | Under 20 lbs |
| 🐕 | `medium-size` | Medium | 20-50 lbs |
| 🦮 | `large-size` | Large | Over 50 lbs |

### 3. Behavioral Alerts

Critical behavioral information that affects handling and placement.

| Icon | ID | Label | Description |
|------|-----|-------|-------------|
| 🐕‍🦺⚔️ | `dog-aggressive` | Dog Aggressive | Aggressive towards other dogs |
| ♂️⚔️ | `male-aggressive` | Male Aggressive | Aggressive towards male dogs |
| 👤⚠️ | `owner-aggressive` | Owner Aggressive | Protective/aggressive when owner is present |
| 🦮⚠️ | `leash-aggressive` | Leash Aggressive | Reactive when on leash |
| 💩🚫 | `poop-eater` | Poop Eater | Eats feces - requires immediate cleanup |
| 🧱⚔️ | `fence-fighter` | Fence Fighter | Reactive to animals on other side of fences |
| 🦴🚫 | `no-collar` | No Collar | Cannot wear collar - harness only |
| 🛏️🚫 | `no-bedding` | No Bedding | Destroys or eats bedding materials |
| ⚡😰 | `thunder-reactive` | Thunder Reactive | Sensitive to loud noises/storms |
| 🕳️🐾 | `digger` | Digger | Tends to dig in yard areas |
| 🦷😬 | `mouthy` | Mouthy | May nip or play-bite during excitement |
| 🔊🐕 | `barker` | Barker | Excessive barking |
| 🏃💨 | `escape-artist` | Escape Artist | Attempts to escape from kennels/yards |
| 🦴⚠️ | `resource-guarder` | Resource Guarder | Guards food, toys, or space |

### 4. Medical

Health-related information and requirements.

| Icon | ID | Label | Description |
|------|-----|-------|-------------|
| 💊 | `medication-required` | Medication Required | Needs regular medication |
| 🩺 | `medical-monitoring` | Medical Monitoring | Requires special health monitoring |
| 🦴 | `mobility-issues` | Mobility Issues | Has difficulty with movement |
| 🍽️ | `special-diet` | Special Diet | Has dietary restrictions or requirements |
| ⚠️ | `allergies` | Allergies | Has known allergies |
| 🧴 | `skin-condition` | Skin Condition | Has skin allergies or sensitivities |

### 5. Handling Requirements

Special instructions for staff when handling the pet.

| Icon | ID | Label | Description |
|------|-----|-------|-------------|
| ⚠️ | `advanced-handling` | Advanced Handling | Requires experienced staff |
| 👋 | `approach-slowly` | Approach Slowly | Needs gentle introduction |
| 🦺 | `harness-only` | Harness Only | Should not be walked with collar only |

### 6. Custom Flags

Generic flags for custom notes and special situations.

| Icon | ID | Label | Description | Color |
|------|-----|-------|-------------|-------|
| 🟥 | `red-flag` | Red Flag | Critical issue (custom) | #f44336 |
| 🟨 | `yellow-flag` | Yellow Flag | Caution needed (custom) | #ffeb3b |
| 🟩 | `green-flag` | Green Flag | Positive note (custom) | #4caf50 |
| 🟦 | `blue-flag` | Blue Flag | Special instruction (custom) | #2196f3 |
| ⬜ | `white-flag` | White Flag | General note (custom) | #ffffff |

---

## Usage

### Adding Icons to a Pet

1. Navigate to **Pets** → Select a pet → **Edit**
2. Scroll to the **Pet Icons** section
3. Click on icons to select/deselect them
4. Hover over icons to see descriptions
5. Save the pet profile

### Viewing Icons

Icons appear in multiple locations:

- **Dashboard**: Next to pet names in reservation list
- **Kennel Cards**: Printed cards for each kennel
- **Pet List**: In the pets table
- **Reservation Details**: When viewing reservation information
- **Customer Portal**: Visible to customers (if enabled)

### Best Practices

**DO:**
- ✅ Use icons consistently across all pets
- ✅ Update icons when pet behavior changes
- ✅ Combine multiple icons for complete picture
- ✅ Use custom flags with detailed notes
- ✅ Review icons during check-in

**DON'T:**
- ❌ Over-use icons (only add relevant ones)
- ❌ Forget to update icons after incidents
- ❌ Use custom flags without adding notes
- ❌ Ignore icons during pet placement

---

## Technical Implementation

### Frontend Components

**EmojiPetIconSelector** (`/frontend/src/components/pets/EmojiPetIconSelector.tsx`)
- Main icon selection interface
- Organized by category
- Includes tooltips with descriptions
- Handles icon selection/deselection

**PetNameWithIcons** (`/frontend/src/components/pets/PetNameWithIcons.tsx`)
- Displays pet name with icons inline
- Used in lists and tables
- Shows icon emojis only (no labels)

**PrintablePetIcons** (`/frontend/src/components/kennels/PrintablePetIcons.tsx`)
- Optimized for printing
- Used in kennel cards
- Print-specific styling

### Icon Definitions

**Location**: `/frontend/src/constants/petIcons.ts`

**Structure**:
```typescript
interface PetIcon {
  id: string;           // Unique identifier
  category: string;     // Category name
  icon: string;         // Emoji representation
  label: string;        // Display name
  description: string;  // Full description
  color?: string;       // Optional color (for flags)
}
```

**Categories**:
- `group` - Group compatibility
- `size` - Size category
- `behavior` - Behavioral alerts
- `medical` - Medical information
- `handling` - Handling requirements
- `flag` - Custom flags

### Database Storage

Icons are stored in the `Pet` model:

```typescript
petIcons: string[]  // Array of icon IDs
iconNotes: {        // Custom notes for flag icons
  [iconId: string]: string
}
```

**Example**:
```json
{
  "petIcons": ["dog-aggressive", "medication-required", "red-flag"],
  "iconNotes": {
    "red-flag": "Bit another dog on Nov 1st - keep separated"
  }
}
```

---

## API Endpoints

### Get Pet with Icons

```http
GET /api/pets/:id
```

**Response**:
```json
{
  "id": "pet-123",
  "name": "Buddy",
  "petIcons": ["dog-aggressive", "large-size", "medication-required"],
  "iconNotes": {
    "dog-aggressive": "Only aggressive towards small dogs"
  }
}
```

### Update Pet Icons

```http
PUT /api/pets/:id
```

**Request Body**:
```json
{
  "petIcons": ["dog-aggressive", "large-size"],
  "iconNotes": {
    "dog-aggressive": "Updated note"
  }
}
```

---

## Testing

### Unit Tests

**Location**: `/frontend/src/components/pets/__tests__/EmojiPetIconSelector.test.tsx`

**Coverage**:
- ✅ Rendering all categories
- ✅ Icon selection/deselection
- ✅ Multiple selections
- ✅ Tooltip display
- ✅ Selected icons display
- ✅ Delete functionality
- ✅ Accessibility

**Run Tests**:
```bash
cd frontend
npm test -- EmojiPetIconSelector
```

### Manual Testing Checklist

- [ ] Icons display correctly in pet edit form
- [ ] Tooltips show on hover
- [ ] Icons can be selected/deselected
- [ ] Selected icons appear in "Selected" section
- [ ] Icons save correctly
- [ ] Icons display in dashboard
- [ ] Icons display in kennel cards
- [ ] Icons print correctly
- [ ] All behavioral icons are present
- [ ] Custom flag notes work

---

## Migration Notes

### Version 2.0 Changes (November 5, 2025)

**Added Icons**:
- Dog Aggressive 🐕‍🦺⚔️
- Male Aggressive ♂️⚔️
- Owner Aggressive 👤⚠️
- Leash Aggressive 🦮⚠️
- Poop Eater 💩🚫
- No Collar 🦴🚫

**Updated Icons**:
- Fence Fighter: 🧱 → 🧱⚔️
- No Bedding: 🛏️ → 🛏️🚫
- Thunder Reactive: ⚡ → ⚡😰
- Digger: 🕳️ → 🕳️🐾
- Mouthy: 🦷 → 🦷😬
- Barker: 🔊 → 🔊🐕
- Escape Artist: 🏃 → 🏃💨
- Resource Guarder: 🚫 → 🦴⚠️

**Removed**:
- Generic emoji icons (replaced with organized system)

**Breaking Changes**:
- Old emoji-based icons will not display
- Pets need to be updated with new icon IDs
- Migration script available if needed

---

## Troubleshooting

### Icons Not Displaying

**Problem**: Icons don't show up in the UI

**Solutions**:
1. Clear browser cache (Cmd+Shift+R)
2. Check that `petIcons` array exists in pet data
3. Verify icon IDs match constants in `petIcons.ts`
4. Check console for errors

### Icons Not Saving

**Problem**: Selected icons don't persist after save

**Solutions**:
1. Check network tab for API errors
2. Verify pet update endpoint is working
3. Check database permissions
4. Ensure `petIcons` field is in schema

### Tooltips Not Showing

**Problem**: Hover tooltips don't appear

**Solutions**:
1. Check Material-UI Tooltip component is imported
2. Verify `title` prop is set correctly
3. Check for CSS conflicts
4. Test in different browser

### Print Issues

**Problem**: Icons don't print correctly on kennel cards

**Solutions**:
1. Use `PrintablePetIcons` component
2. Check print-specific CSS
3. Verify `@media print` styles
4. Test with different printers

---

## Future Enhancements

### Planned Features

- [ ] Icon color customization
- [ ] Custom icon upload
- [ ] Icon history tracking
- [ ] Bulk icon assignment
- [ ] Icon-based filtering
- [ ] Icon analytics/reporting
- [ ] Mobile app icon display
- [ ] Icon permissions by role

### Requested Features

Submit feature requests via:
- GitHub Issues
- Internal feedback form
- Direct to development team

---

## Support

### Documentation
- Main README: `/README.md`
- API Documentation: `/docs/API.md`
- Component Documentation: Inline JSDoc comments

### Contact
- Development Team: dev@tailtown.com
- Support: support@tailtown.com
- Emergency: (555) 123-4567

---

**Last Updated**: November 5, 2025  
**Version**: 2.0  
**Author**: Development Team

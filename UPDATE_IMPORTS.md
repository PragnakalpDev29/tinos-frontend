# Import Update Guide

## 🔄 Quick Reference for Updating Page Imports

All pages in the `(marketing)` folder need their imports updated to use the new structure.

## Before & After Examples

### Example 1: Basic Page

**Before:**
```typescript
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Image } from '@/components/Image';
import { Link } from '@/components/Link';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Menu } from 'lucide-react';
import { Search } from 'lucide-react';
import { User } from 'lucide-react';
```

**After:**
```typescript
import { Badge, Button, Image, Link, Text, Input } from '@/components/ui'
import { Menu, Search, User } from 'lucide-react'
```

### Example 2: Page with Many Icons

**Before:**
```typescript
import { Apple } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Baby } from 'lucide-react';
import { Brain } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { Facebook } from 'lucide-react';
```

**After:**
```typescript
import { 
  Apple, 
  ArrowRight, 
  Baby, 
  Brain, 
  CheckCircle, 
  Facebook 
} from 'lucide-react'
```

## 📋 Files That Need Updates

All pages in these directories need import updates:

```
src/app/(marketing)/
├── about/page.jsx          ⚠️ Needs update
├── contact/page.jsx        ⚠️ Needs update
├── doctor-profile/page.jsx ⚠️ Needs update
├── doctors/page.jsx        ⚠️ Needs update
├── faq/page.jsx            ⚠️ Needs update
├── how-it-works/page.jsx   ⚠️ Needs update
├── login/page.jsx          ⚠️ Needs update
├── pricing/page.jsx        ⚠️ Needs update
├── privacy/page.jsx        ⚠️ Needs update
├── specialties/page.jsx    ⚠️ Needs update
├── specialty-detail/page.jsx ⚠️ Needs update
└── terms/page.jsx          ⚠️ Needs update
```

## 🔍 Find & Replace Patterns

Use your editor's find & replace feature:

### Pattern 1: Component Imports
**Find:** `import { (\w+) } from '@/components/\1';`
**Replace:** (Manual - group all components)

### Pattern 2: Icon Imports
**Find:** `import { (\w+) } from 'lucide-react';`
**Replace:** (Manual - group all icons)

## ✅ Verification Checklist

After updating each file:

- [ ] All component imports use `@/components/ui`
- [ ] All icon imports are grouped in one statement
- [ ] No duplicate imports
- [ ] File still compiles without errors
- [ ] Page renders correctly

## 🛠️ Manual Update Steps

For each page file:

1. **Identify all component imports**
   ```typescript
   import { Badge } from '@/components/Badge'
   import { Button } from '@/components/Button'
   // ... etc
   ```

2. **Replace with single import**
   ```typescript
   import { Badge, Button, Image, Link, Text, Input } from '@/components/ui'
   ```

3. **Group all icon imports**
   ```typescript
   import { Menu, Search, User, Star, Heart } from 'lucide-react'
   ```

4. **Test the page**
   ```bash
   npm run dev
   ```

## 🚨 Common Issues

### Issue 1: Module Not Found
```
Cannot find module '@/components/ui'
```
**Solution:** Ensure TypeScript is installed and `tsconfig.json` has correct paths.

### Issue 2: Named Export Not Found
```
Module has no exported member 'ComponentName'
```
**Solution:** Check `components/ui/index.ts` includes the export.

### Issue 3: Type Errors
```
Property 'variant' does not exist on type...
```
**Solution:** Component now uses TypeScript. Check the new interface definition.

## 📝 Example Full Update

### Before (doctors/page.jsx):
```typescript
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Facebook } from 'lucide-react';
import { Image } from '@/components/Image';
import { Link } from '@/components/Link';
import { Linkedin } from 'lucide-react';
import { Menu } from 'lucide-react';
import { PlusSquare } from 'lucide-react';
import { Search } from 'lucide-react';
import { Star } from 'lucide-react';
import { Text } from '@/components/Text';
import { Twitter } from 'lucide-react';
```

### After (doctors/page.jsx):
```typescript
import { Badge, Button, Image, Link, Text } from '@/components/ui'
import { 
  Facebook, 
  Linkedin, 
  Menu, 
  PlusSquare, 
  Search, 
  Star, 
  Twitter 
} from 'lucide-react'
```

## 🎯 Benefits After Update

1. **Cleaner Code** - Fewer import lines
2. **Better Organization** - Grouped by source
3. **Type Safety** - Full TypeScript support
4. **Consistency** - Same pattern across all files
5. **Maintainability** - Easier to add/remove components

## 🔗 Related Documentation

- `MIGRATION_GUIDE.md` - Full migration details
- `RESTRUCTURE_SUMMARY.md` - Quick reference
- `PROJECT_STRUCTURE.md` - Directory overview

---

**Status**: 1/13 pages updated (page.tsx complete)
**Remaining**: 12 pages in (marketing) folder

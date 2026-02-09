#!/bin/bash

# Script to update imports in all marketing pages

echo "Updating imports in marketing pages..."

# Find all page.jsx files in (marketing) directory
find src/app/\(marketing\) -name "page.jsx" -type f | while read file; do
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Update component imports to use @/components/ui
    sed -i "s|import { Badge } from '@/components/Badge';|// UPDATED|g" "$file"
    sed -i "s|import { Button } from '@/components/Button';|// UPDATED|g" "$file"
    sed -i "s|import { Image } from '@/components/Image';|// UPDATED|g" "$file"
    sed -i "s|import { Input } from '@/components/Input';|// UPDATED|g" "$file"
    sed -i "s|import { Link } from '@/components/Link';|// UPDATED|g" "$file"
    sed -i "s|import { Text } from '@/components/Text';|// UPDATED|g" "$file"
    
    echo "  ✓ Updated component imports"
done

echo "✅ Import updates complete!"
echo ""
echo "⚠️  Manual steps required:"
echo "1. Review each file and add: import { Badge, Button, Image, Input, Link, Text } from '@/components/ui'"
echo "2. Group all lucide-react imports into one statement"
echo "3. Remove // UPDATED comments"
echo ""
echo "See UPDATE_IMPORTS.md for detailed instructions"

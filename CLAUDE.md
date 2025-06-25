# TeamManager Development Guide

## Quick Commands

### Frontend Development
```bash
cd frontend
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
npm run lint           # Check code quality with ESLint
npm run lint:fix       # Auto-fix ESLint issues
```

### Backend Development
```bash
node structured-practice-mock.js  # Start mock backend server
```

## Code Quality

### ESLint Configuration
- ✅ ESLint configured with TypeScript support
- ✅ React hooks rules enabled
- ✅ Custom rules for code quality
- ✅ Auto-fix capabilities working

### Current Status
- **70 warnings, 0 errors** (as of latest run)
- Most warnings are `any` types and console statements
- All critical errors fixed

### Running Code Quality Checks
```bash
# Check all files
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check with no warnings allowed (strict mode)
npm run lint -- --max-warnings 0
```

## Project Structure

### Frontend (`/frontend`)
- **Components**: Reusable UI components in `/src/components`
- **Pages**: Route-level components in `/src/pages`
- **Services**: API calls and external services in `/src/services`
- **Types**: TypeScript interfaces in `/src/types`
- **Contexts**: React contexts for state management in `/src/contexts`

### Backend
- **Mock Server**: `structured-practice-mock.js` provides full API simulation
- **Endpoints**: REST API with full CRUD operations for all entities

## Key Features Implemented

### ✅ Practice Management System
- **Practice Activities**: Reusable activities with tagging and search
- **Practice Plans**: Templates composed of activities
- **Scheduled Practices**: Events with linked practice plans

### ✅ Event Management
- **Events**: Games, practices, meetings with full CRUD
- **Practice Plan Assignment**: Link practice plans to practice events
- **Game Details**: Opponent tracking, home/away designation

### ✅ Activity Library
- **Comprehensive CRUD**: Create, read, update, delete activities
- **Advanced Filtering**: Search by name, category, tags, difficulty
- **Rich Metadata**: Equipment, player counts, instructions, variations

## Development Notes

### Authentication
- Currently using local authentication context
- Firebase authentication system removed in favor of simpler mock system

### Data Flow
- Frontend → API Service → Mock Backend
- Full TypeScript typing throughout
- Consistent error handling patterns

### Code Quality Issues to Address
1. **Replace `any` types**: Gradually replace with proper TypeScript interfaces
2. **Console statements**: Implement proper logging service
3. **Type safety**: Add more specific types throughout codebase

## Quick Fixes Applied
- ✅ Fixed unused variable in TopNav.tsx
- ✅ Fixed React Hook dependency in useWebSocket.ts
- ✅ Resolved ESLint configuration issues
- ✅ Added comprehensive linting rules
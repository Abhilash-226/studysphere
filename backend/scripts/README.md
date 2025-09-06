# Backend Scripts

This directory contains various scripts organized by purpose:

## Directory Structure

### `/data-migration/`

Scripts for migrating and fixing existing data in the database:

- `fixUserData.js` - Fix user data inconsistencies
- `fixTutorData.js` - Fix tutor profile data and subjects
- `fixTutorSubjects.js` - Fix tutor subject assignments
- `fixSubjects.js` - Fix subject data
- `fixNames.js` - Fix name formatting issues

### `/database/`

Database management and maintenance scripts:

- `fix_conversation_index.js` - Fix conversation indexing issues
- `mongo_reindex_and_normalize.js` - MongoDB reindexing and normalization
- `fix_index.ps1` - PowerShell script for index fixes
- `run_migration_and_restart.ps1` - Migration runner with restart

### `/development/`

Development and debugging utilities:

- `checkTutor.js` - Check tutor data integrity
- `checkUser.js` - Check user data integrity
- `checkUserData.js` - Validate user data structure
- `testFixes.js` - Test data fix implementations
- `tutor-filtering-test.js` - Test tutor filtering functionality

## Usage

### Running Data Migration Scripts

```bash
cd backend
node scripts/data-migration/fixUserData.js
```

### Running Database Scripts

```bash
cd backend
node scripts/database/fix_conversation_index.js
```

### Running Development Scripts

```bash
cd backend
node scripts/development/checkTutor.js
```

## Environment Setup

Make sure to have your `.env` file configured with the appropriate database connection settings before running any scripts.

## Safety Note

**Always backup your database before running migration scripts!**

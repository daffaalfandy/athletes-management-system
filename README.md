# Judo Command Center

**Athletes Management System for Judo Competitions**

A powerful, offline-first desktop application designed to streamline athlete registration, roster management, and tournament preparation for Judo coaches and administrators. Built with Electron, React, and SQLite for maximum performance and reliability.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building the Application](#building-the-application)
- [Project Structure](#project-structure)
- [Database Management](#database-management)
- [Maintenance](#maintenance)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Judo Command Center is a comprehensive athlete management system designed specifically for Judo competitions. It reduces tournament registration preparation time from ~4 hours to **under 15 minutes** while maintaining a 0% rejection rate due to technical errors.

### Design Philosophy

- **100% Offline**: No internet connection required for core functionality
- **Lightning Fast**: Sub-100ms response time for roster filtering operations
- **Data Privacy**: All data stored locally on your machine
- **Professional Output**: Generate tournament-ready PDFs and exports
- **Crash Resilient**: SQLite WAL mode ensures data integrity even during power loss

---

## ✨ Key Features

### Athlete Management
- Complete CRUD operations for athlete profiles
- High-density list view with visual belt indicators
- Detailed athlete information (contact, parent/guardian details)
- Profile photo management
- Rank progression history tracking
- Medal and achievement records

### Competition Management
- Tournament creation and management
- Automated tournament history tracking
- Weight class assignment with conflict detection
- Ruleset configuration and snapshotting
- Age category calculation based on birth year
- Roster assembly with eligibility validation

### Digital Dossier
- Certificate and document attachment
- Profile photo management
- Local file system integration
- Document preview and verification

### Export & Reporting
- Professional PDF roster printouts
- Archive summary generation
- Tournament-specific exports
- Kabupaten/Club branding integration

### Institutional Branding
- Customizable Regency (Kabupaten) branding
- Club logo management
- Executive dashboard with KPIs
- Medallion summary with year filtering

### Advanced Analytics
- Automated tournament history
- Medal records linked to tournaments
- Activity status tracking (Active/Intermittent/Inactive)
- Gender distribution analytics

---

## 🛠 Technology Stack

### Core Framework
- **Electron**: `39.2.7` - Desktop application shell
- **Electron Forge**: `^7.10.2` - Build tooling and packaging
- **Vite**: `^5.4.21` - Fast development and bundling

### Frontend
- **React**: `^19.2.3` - UI framework
- **TypeScript**: `~4.5.4` - Type-safe development
- **Zustand**: `^5.0.9` - State management
- **React Hook Form**: `^7.69.0` - Form handling
- **Tailwind CSS**: `^4.1.18` - Styling framework
- **Lucide React**: `^0.562.0` - Icon library

### Backend & Data
- **better-sqlite3**: `^12.5.0` - SQLite database (WAL mode)
- **Zod**: `^4.2.1` - Runtime validation
- **PDFKit**: `^0.15.0` - PDF generation

### Development Tools
- **ESLint**: Code quality
- **TypeScript ESLint**: TypeScript-specific linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control
- **Operating System**: 
  - macOS 10.13 or higher
  - Windows 10/11
  - Linux (Ubuntu 18.04+ or equivalent)

### Verify Installation

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd athletes-management-system
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including Electron, React, and native modules like `better-sqlite3`.

### 3. Verify Installation

```bash
npm run start
```

The application should launch successfully. If you encounter any issues, see the [Troubleshooting](#troubleshooting) section.

---

## 💻 Development

### Starting the Development Server

```bash
npm run start
```

This command:
- Starts the Electron application in development mode
- Enables Hot Module Replacement (HMR) for instant updates
- Opens DevTools automatically
- Watches for file changes in both main and renderer processes

### Development Workflow

1. **Main Process Changes** (`src/main/`):
   - Requires application restart
   - Changes to database, IPC handlers, or services

2. **Renderer Process Changes** (`src/renderer/`):
   - Hot reloads automatically
   - UI components, state management, hooks

3. **Shared Code Changes** (`src/shared/`):
   - May require restart depending on usage
   - Type definitions, schemas, utilities

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Database Seeding (Development)

To populate the database with sample data:

```bash
# Ensure the app has been run at least once to create the database
sqlite3 ~/Library/Application\ Support/athletes-management-system/database.db < scripts/seed-athletes.sql
```

**Note**: Adjust the path based on your operating system:
- **macOS**: `~/Library/Application Support/athletes-management-system/`
- **Windows**: `%APPDATA%/athletes-management-system/`
- **Linux**: `~/.config/athletes-management-system/`

---

## 🏗 Building the Application

### Development Build

For testing the packaged application without distribution:

```bash
npm run package
```

This creates a packaged application in the `out/` directory without creating installers.

### Production Build

To create distributable installers:

```bash
npm run make
```

This command:
- Packages the application
- Creates platform-specific installers
- Outputs to `out/make/` directory

**Output Formats by Platform**:
- **macOS**: `.zip` archive (via MakerZIP)
- **Windows**: `.exe` installer (via MakerSquirrel)
- **Linux**: `.deb` and `.rpm` packages

### Build Configuration

The build process is configured in `forge.config.ts`:

```typescript
{
  packagerConfig: {
    asar: true,  // Package app into ASAR archive
  },
  makers: [
    MakerSquirrel,  // Windows installer
    MakerZIP,       // macOS archive
    MakerDeb,       // Debian package
    MakerRpm,       // RedHat package
  ]
}
```

### Publishing

```bash
npm run publish
```

**Note**: Publishing requires proper configuration of distribution channels (GitHub Releases, S3, etc.) in `forge.config.ts`.

---

## 📁 Project Structure

```
athletes-management-system/
├── src/
│   ├── main/                    # Electron Main Process (Node.js)
│   │   ├── main.ts              # Application entry point
│   │   ├── preload.ts           # IPC bridge & context isolation
│   │   ├── database/            # SQLite connection & initialization
│   │   ├── migrations/          # Database schema migrations
│   │   ├── repositories/        # Data access layer (Repository pattern)
│   │   ├── services/            # Business logic & system services
│   │   └── ipc/                 # IPC handler registration
│   │
│   ├── renderer/                # React Renderer Process
│   │   ├── renderer.tsx         # React entry point
│   │   ├── App.tsx              # Root component
│   │   ├── features/            # Feature-based modules
│   │   │   ├── athletes/        # Athlete management
│   │   │   ├── tournaments/     # Tournament management
│   │   │   ├── dashboard/       # Executive dashboard
│   │   │   ├── settings/        # Application settings
│   │   │   └── clubs/           # Club management
│   │   ├── store/               # Zustand state stores
│   │   ├── hooks/               # Custom React hooks
│   │   └── components/          # Shared UI components
│   │
│   ├── shared/                  # Shared code (Main & Renderer)
│   │   ├── types/               # TypeScript type definitions
│   │   ├── schemas.ts           # Zod validation schemas
│   │   └── constants.ts         # Application constants
│   │
│   └── index.css                # Global styles
│
├── docs/                        # Documentation
│   ├── planning-artifacts/      # PRD, Architecture, Epics
│   └── project-context.md       # AI agent guidelines
│
├── scripts/                     # Utility scripts
│   └── seed-athletes.sql        # Sample data for development
│
├── forge.config.ts              # Electron Forge configuration
├── vite.main.config.ts          # Vite config for main process
├── vite.preload.config.ts       # Vite config for preload script
├── vite.renderer.config.ts      # Vite config for renderer
├── tailwind.config.mjs          # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project dependencies & scripts
```

### Key Architectural Patterns

#### 1. Process Separation
- **Main Process**: Database operations, file system access, system integration
- **Renderer Process**: UI rendering, user interaction, state management
- **IPC Bridge**: Typed communication via `preload.ts`

#### 2. Repository Pattern
All database queries are centralized in repositories:
```typescript
// src/main/repositories/athleteRepository.ts
export const athleteRepository = {
  findAll: () => db.prepare('SELECT * FROM athletes').all(),
  findById: (id: number) => db.prepare('SELECT * FROM athletes WHERE id = ?').get(id),
  // ...
};
```

#### 3. Feature-Based Organization
Each feature is self-contained with its own components, hooks, and stores:
```
features/athletes/
├── AthleteList.tsx
├── AthleteForm.tsx
├── AthleteDetail.tsx
├── useAthleteStore.ts
└── hooks/
    └── useAthletes.ts
```

---

## 🗄 Database Management

### Database Location

The SQLite database is stored in the application's user data directory:

- **macOS**: `~/Library/Application Support/athletes-management-system/database.db`
- **Windows**: `%APPDATA%/athletes-management-system/database.db`
- **Linux**: `~/.config/athletes-management-system/database.db`

### Database Features

- **WAL Mode**: Write-Ahead Logging for crash recovery
- **Automatic Migrations**: Schema updates applied on startup
- **Backup/Restore**: Manual snapshot functionality via UI

### Migration System

Migrations are TypeScript files in `src/main/migrations/`:

```typescript
// src/main/migrations/001_initial_schema.ts
export const migration_001 = {
  version: 1,
  name: 'initial_schema',
  up: (db: Database) => {
    db.exec(`
      CREATE TABLE athletes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        -- ...
      );
    `);
  }
};
```

### Manual Database Access

For debugging or manual operations:

```bash
# macOS/Linux
sqlite3 ~/Library/Application\ Support/athletes-management-system/database.db

# Windows (PowerShell)
sqlite3 $env:APPDATA\athletes-management-system\database.db
```

Common queries:
```sql
-- View all tables
.tables

-- View schema
.schema athletes

-- Query data
SELECT * FROM athletes LIMIT 10;

-- Exit
.quit
```

---

## 🔧 Maintenance

### Updating Dependencies

#### Check for Updates
```bash
npm outdated
```

#### Update All Dependencies
```bash
npm update
```

#### Update Specific Package
```bash
npm install <package-name>@latest
```

#### Update Electron
```bash
npm install electron@latest --save-dev
```

**⚠️ Important**: After updating Electron, rebuild native modules:
```bash
npm rebuild better-sqlite3
```

### Database Maintenance

#### Backup Database
Use the built-in "Export Database" feature in Settings, or manually:

```bash
# macOS/Linux
cp ~/Library/Application\ Support/athletes-management-system/database.db \
   ~/Desktop/backup-$(date +%Y%m%d).db

# Windows (PowerShell)
Copy-Item "$env:APPDATA\athletes-management-system\database.db" `
          "$env:USERPROFILE\Desktop\backup-$(Get-Date -Format 'yyyyMMdd').db"
```

#### Restore Database
1. Close the application
2. Replace the database file with your backup
3. Restart the application

#### Optimize Database
```bash
sqlite3 database.db "VACUUM;"
```

### Clearing Application Data

To reset the application to a fresh state:

1. **Close the application**
2. **Delete the user data directory**:
   ```bash
   # macOS
   rm -rf ~/Library/Application\ Support/athletes-management-system
   
   # Windows
   rmdir /s "%APPDATA%\athletes-management-system"
   
   # Linux
   rm -rf ~/.config/athletes-management-system
   ```
3. **Restart the application** (fresh database will be created)

---

## 🧪 Testing

### Manual Testing Checklist

#### Athlete Management
- [ ] Create new athlete
- [ ] Edit athlete details
- [ ] Delete athlete
- [ ] Upload profile photo
- [ ] Add rank history
- [ ] Add medal records

#### Tournament Management
- [ ] Create tournament
- [ ] Add athletes to roster
- [ ] Assign weight classes
- [ ] View eligibility warnings
- [ ] Export PDF roster

#### Data Integrity
- [ ] Backup database
- [ ] Restore from backup
- [ ] Verify data after crash (simulate by force-quit)

### Performance Testing

```bash
# Monitor application performance
# Open DevTools (Cmd/Ctrl + Shift + I) and check:
# - Network tab (should show no external requests)
# - Performance tab (roster filtering should be < 100ms)
# - Memory tab (check for leaks during extended use)
```

---

## 🐛 Troubleshooting

### Application Won't Start

**Symptom**: Application crashes on launch or shows blank screen

**Solutions**:
1. Check Node.js version: `node --version` (should be 18.x+)
2. Rebuild native modules:
   ```bash
   npm rebuild better-sqlite3
   ```
3. Clear Electron cache:
   ```bash
   rm -rf node_modules/.vite
   npm run start
   ```

### Database Errors

**Symptom**: "Database is locked" or "SQLITE_BUSY" errors

**Solutions**:
1. Ensure only one instance of the app is running
2. Check file permissions on database directory
3. Disable antivirus temporarily (may lock database files)

### Build Failures

**Symptom**: `npm run make` fails

**Solutions**:
1. Clear build artifacts:
   ```bash
   rm -rf out/
   npm run package
   ```
2. Check disk space (builds require ~500MB free)
3. On Windows, run as Administrator if permission errors occur

### Native Module Issues

**Symptom**: "Module did not self-register" or "The specified module could not be found"

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm rebuild better-sqlite3
```

### Performance Issues

**Symptom**: Slow roster filtering or UI lag

**Solutions**:
1. Check database size (VACUUM if > 100MB)
2. Ensure WAL mode is enabled
3. Profile with DevTools Performance tab
4. Reduce number of simultaneous filters

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOENT: no such file or directory` | Missing database file | Restart app to recreate |
| `Cannot find module 'electron'` | Incomplete installation | Run `npm install` |
| `Failed to load resource` | Vite dev server issue | Restart dev server |
| `FOREIGN KEY constraint failed` | Data integrity violation | Check related records exist |

---

## 🤝 Contributing

### Development Guidelines

1. **Follow the Architecture**: Adhere to patterns in `docs/project-context.md`
2. **Type Safety**: No `any` types; use `unknown` if necessary
3. **Process Separation**: Never import `better-sqlite3` in renderer code
4. **Feature Organization**: Keep features self-contained
5. **Naming Conventions**:
   - Components: `PascalCase`
   - Files/Variables: `camelCase`
   - Database: `snake_case`

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS utility classes
- **Forms**: React Hook Form + Zod validation

### Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes following the guidelines
3. Test thoroughly (see [Testing](#testing))
4. Run linter: `npm run lint`
5. Commit with descriptive messages
6. Push and create a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues, questions, or contributions:

- **Author**: Daffa Alfandy
- **Email**: m.daffaalfandy@gmail.com
- **Documentation**: See `docs/` directory for detailed planning artifacts

---

## 🎯 Roadmap

### Completed Features ✅
- Epic 1: Project Foundation & Core Infrastructure
- Epic 2: Athlete Management (CRUD & List)
- Epic 3: Rulesets & Dynamic Eligibility
- Epic 4: Digital Dossier (Document Management)
- Epic 5: Roster Selection & Competition
- Epic 6: Export Factory (PDF & Data)
- Epic 7: Institutional Branding & Polish
- Epic 8: Advanced Competition History & Analytics (In Progress)

### Future Enhancements 🚀
- Multi-language support (Indonesian/English)
- Advanced analytics and reporting
- Cloud backup integration (optional)
- Mobile companion app for roster viewing
- Tournament bracket generation

---

## 🙏 Acknowledgments

Built with modern web technologies and designed specifically for the Judo community to streamline competition management and athlete tracking.

**Tech Stack Credits**:
- Electron Team for the amazing desktop framework
- React Team for the UI library
- SQLite for the robust database engine
- All open-source contributors

---

**Made with ❤️ for Judo Coaches and Athletes**

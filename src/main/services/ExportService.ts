import { ipcMain, dialog } from 'electron';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { getDatabase } from '../db';
import { TournamentRepository } from '../repositories/tournamentRepository';
import { TournamentRosterRepository } from '../repositories/tournamentRosterRepository';
import { athleteRepository } from '../repositories/athleteRepository';
import { clubRepository } from '../repositories/clubRepository';
import { Tournament, Athlete, TournamentRosterEntry, Club, Ruleset, AgeCategory } from '../../shared/schemas';

interface RosterAthleteData extends Athlete {
    clubName?: string;
    ageCategory?: string;
    assignedWeightClass: string;
}

interface GroupedRoster {
    categoryName: string;
    categoryGender: string;
    weightClasses: {
        label: string;
        athletes: RosterAthleteData[];
    }[];
}

interface ExportOptions {
    includeColumns?: string[];
    savePath?: string;
}

let tournamentRepository: TournamentRepository;
let tournamentRosterRepository: TournamentRosterRepository;

export function setupExportHandlers() {
    const db = getDatabase();
    tournamentRepository = new TournamentRepository(db);
    tournamentRosterRepository = new TournamentRosterRepository(db);

    ipcMain.handle('export:generateRosterPDF', async (event, tournamentId: number, options?: ExportOptions) => {
        try {
            // Show save dialog
            const result = await dialog.showSaveDialog({
                title: 'Save Roster PDF',
                defaultPath: await getDefaultFilename(tournamentId),
                filters: [
                    { name: 'PDF Files', extensions: ['pdf'] }
                ]
            });

            if (result.canceled || !result.filePath) {
                return { success: false, error: 'Save cancelled by user' };
            }

            // Generate PDF
            const filePath = await generateRosterPDF(tournamentId, {
                ...options,
                savePath: result.filePath
            });

            return { success: true, filePath };
        } catch (error) {
            console.error('Error generating roster PDF:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    });
}

async function getDefaultFilename(tournamentId: number): Promise<string> {
    try {
        const tournament = tournamentRepository.findById(tournamentId);
        if (!tournament) {
            return 'Roster.pdf';
        }

        const sanitizedName = tournament.name.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        const filename = `${sanitizedName}_Roster_${date}`;
        // Ensure .pdf extension is always present
        return filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    } catch (error) {
        console.error('Error generating default filename:', error);
        return 'Roster.pdf';
    }
}

async function generateRosterPDF(
    tournamentId: number,
    options: ExportOptions
): Promise<string> {
    // Validate input
    if (!tournamentId || typeof tournamentId !== 'number' || tournamentId <= 0) {
        throw new Error('Invalid tournament ID');
    }

    // Fetch tournament data
    const tournament = tournamentRepository.findById(tournamentId);
    if (!tournament) {
        throw new Error('Tournament not found');
    }

    // Fetch roster entries
    const rosterEntries = tournamentRosterRepository.getRoster(tournamentId);
    if (rosterEntries.length === 0) {
        throw new Error('No athletes in roster');
    }

    // Fetch all athletes in roster
    const athleteIds = rosterEntries.map(entry => entry.athlete_id);
    const athletes = athleteRepository.findByIds(athleteIds);

    // Create athlete lookup map
    const athleteMap = new Map<number, Athlete>();
    athletes.forEach(athlete => {
        if (athlete.id) athleteMap.set(athlete.id, athlete);
    });

    // Fetch clubs for athletes
    const clubIds = [...new Set(athletes.map(a => a.clubId).filter(id => id !== null && id !== undefined))] as number[];
    const clubs = clubIds.length > 0 ? clubIds.map(id => clubRepository.getById(id)).filter(c => c !== undefined) as Club[] : [];
    const clubMap = new Map<number, Club>();
    clubs.forEach(club => {
        if (club.id) clubMap.set(club.id, club);
    });

    // Parse ruleset snapshot
    const ruleset: any = JSON.parse(tournament.ruleset_snapshot);
    // The snapshot uses 'age_categories' not 'categories'
    const categories: AgeCategory[] = ruleset.age_categories || ruleset.categories || [];

    if (categories.length === 0) {
        throw new Error('Invalid ruleset: no categories found');
    }

    // Build roster data with enriched athlete info
    const rosterData: RosterAthleteData[] = rosterEntries.map(entry => {
        const athlete = athleteMap.get(entry.athlete_id);
        if (!athlete) {
            throw new Error(`Athlete with ID ${entry.athlete_id} not found`);
        }

        const clubName = athlete.clubId ? clubMap.get(athlete.clubId)?.name : undefined;
        const ageCategory = calculateAgeCategory(athlete, tournament, categories);

        return {
            ...athlete,
            clubName,
            ageCategory: ageCategory?.name,
            assignedWeightClass: entry.weight_class
        };
    });

    // Group athletes by age category and weight class
    const groupedRoster = groupRosterByCategory(rosterData, categories);

    // Generate PDF
    const savePath = options.savePath || path.join(process.cwd(), 'roster.pdf');
    await createPDF(tournament, groupedRoster, savePath, options.includeColumns || []);

    return savePath;
}

function calculateAgeCategory(
    athlete: Athlete,
    tournament: Tournament,
    categories: AgeCategory[]
): AgeCategory | undefined {
    const tournamentYear = new Date(tournament.date).getFullYear();
    const birthYear = new Date(athlete.birthDate).getFullYear();
    const age = tournamentYear - birthYear;

    const athleteGender = athlete.gender === 'male' ? 'M' : 'F';

    return categories.find(cat => {
        const genderMatch = cat.gender === 'MIXED' || cat.gender === athleteGender;
        const ageMatch = age >= cat.min_age && age <= cat.max_age;
        return genderMatch && ageMatch;
    });
}

function groupRosterByCategory(
    rosterData: RosterAthleteData[],
    categories: AgeCategory[]
): GroupedRoster[] {
    const grouped: GroupedRoster[] = [];

    // Group by age category
    categories.forEach(category => {
        const athletesInCategory = rosterData.filter(athlete => athlete.ageCategory === category.name);

        if (athletesInCategory.length === 0) return;

        // Get unique weight classes for this category
        const weightClassLabels = [...new Set(athletesInCategory.map(a => a.assignedWeightClass))];

        const weightClasses = weightClassLabels.map(label => {
            const athletesInClass = athletesInCategory.filter(a => a.assignedWeightClass === label);
            // Sort alphabetically by name
            athletesInClass.sort((a, b) => a.name.localeCompare(b.name));

            return {
                label,
                athletes: athletesInClass
            };
        });

        // Sort weight classes by label
        weightClasses.sort((a, b) => a.label.localeCompare(b.label));

        grouped.push({
            categoryName: category.name,
            categoryGender: category.gender,
            weightClasses
        });
    });

    return grouped;
}

async function createPDF(
    tournament: Tournament,
    groupedRoster: GroupedRoster[],
    savePath: string,
    includeColumns: string[]
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            // Create PDF document in landscape mode
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 36, bottom: 36, left: 36, right: 36 }
            });

            // Pipe to file
            const stream = fs.createWriteStream(savePath);
            doc.pipe(stream);

            // Add metadata
            doc.info.Title = `${tournament.name} - Roster`;
            doc.info.Author = 'Judo Command Center';
            doc.info.Subject = 'Tournament Roster';

            // Render header
            renderHeader(doc, tournament);

            // Render roster groups
            groupedRoster.forEach((group, index) => {
                if (index > 0) {
                    doc.moveDown(2);
                }
                renderCategoryGroup(doc, group, includeColumns);
            });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => resolve());
            stream.on('error', (error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

function renderHeader(doc: PDFKit.PDFDocument, tournament: Tournament) {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Tournament name
    doc.fontSize(20)
        .font('Helvetica-Bold')
        .text(tournament.name, { align: 'center' });

    doc.moveDown(0.5);

    // Tournament details
    doc.fontSize(12)
        .font('Helvetica')
        .text(`Date: ${tournament.date}`, { align: 'center' });

    if (tournament.location) {
        doc.text(`Location: ${tournament.location}`, { align: 'center' });
    }

    doc.moveDown(1);

    // Separator line
    doc.moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();

    doc.moveDown(1);
}

function renderCategoryGroup(
    doc: PDFKit.PDFDocument,
    group: GroupedRoster,
    includeColumns: string[]
) {
    // Category header
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .text(`Age Category: ${group.categoryName} (${group.categoryGender})`, {
            underline: true
        });

    doc.moveDown(0.5);

    // Render each weight class
    group.weightClasses.forEach((weightClass, index) => {
        if (index > 0) {
            doc.moveDown(1);
        }

        // Weight class subheader
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`Weight Class: ${weightClass.label}`, {
                indent: 20
            });

        doc.moveDown(0.3);

        // Render table
        renderAthleteTable(doc, weightClass.athletes, includeColumns);
    });
}

function renderAthleteTable(
    doc: PDFKit.PDFDocument,
    athletes: RosterAthleteData[],
    includeColumns: string[]
) {
    // Define columns
    const baseColumns = [
        { key: 'name', label: 'Name', width: 120 },
        { key: 'birthDate', label: 'Birth Date', width: 80 },
        { key: 'gender', label: 'Gender', width: 50 },
        { key: 'weight', label: 'Weight (kg)', width: 70 },
        { key: 'rank', label: 'Rank', width: 60 }
    ];

    const optionalColumns: { [key: string]: { label: string; width: number } } = {
        birth_place: { label: 'Birth Place', width: 100 },
        region: { label: 'Region', width: 80 },
        address: { label: 'Address', width: 120 },
        phone: { label: 'Phone', width: 90 },
        email: { label: 'Email', width: 120 },
        parent_guardian: { label: 'Parent/Guardian', width: 100 },
        parent_phone: { label: 'Parent Phone', width: 90 },
        clubName: { label: 'Club', width: 100 }
    };

    // Build final column list
    const columns = [...baseColumns];
    includeColumns.forEach(colKey => {
        if (optionalColumns[colKey]) {
            columns.push({
                key: colKey,
                label: optionalColumns[colKey].label,
                width: optionalColumns[colKey].width
            });
        }
    });

    const startX = doc.page.margins.left + 40;
    const startY = doc.y;
    const rowHeight = 20;

    // Calculate total width and adjust if needed
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - 80;
    const scale = totalWidth > pageWidth ? pageWidth / totalWidth : 1;

    // Render header row
    doc.fontSize(9)
        .font('Helvetica-Bold');

    let currentX = startX;
    columns.forEach(col => {
        const colWidth = col.width * scale;
        doc.rect(currentX, startY, colWidth, rowHeight)
            .fillAndStroke('#e0e0e0', '#000000');

        doc.fillColor('#000000')
            .text(col.label, currentX + 4, startY + 5, {
                width: colWidth - 8,
                height: rowHeight - 10,
                ellipsis: true
            });

        currentX += colWidth;
    });

    // Render data rows
    doc.font('Helvetica').fontSize(8);
    let currentY = startY + rowHeight;

    athletes.forEach((athlete, rowIndex) => {
        // Check if we need a new page
        if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            currentY = doc.page.margins.top;
        }

        const fillColor = rowIndex % 2 === 0 ? '#ffffff' : '#f5f5f5';
        currentX = startX;

        columns.forEach(col => {
            const colWidth = col.width * scale;

            // Draw cell background
            doc.rect(currentX, currentY, colWidth, rowHeight)
                .fillAndStroke(fillColor, '#cccccc');

            // Get cell value
            let value = '';
            if (col.key === 'gender') {
                value = athlete.gender === 'male' ? 'M' : 'F';
            } else if (col.key === 'weight') {
                value = athlete.weight.toString();
            } else {
                // Type-safe property access
                const athleteRecord = athlete as unknown as Record<string, unknown>;
                const cellValue = athleteRecord[col.key];
                value = cellValue != null ? String(cellValue) : '';
            }

            // Draw cell text
            doc.fillColor('#000000')
                .text(value, currentX + 4, currentY + 5, {
                    width: colWidth - 8,
                    height: rowHeight - 10,
                    ellipsis: true
                });

            currentX += colWidth;
        });

        currentY += rowHeight;
    });

    doc.y = currentY + 10;
}

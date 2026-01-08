import { getDatabase } from '../db';

/**
 * Generate a unique Member ID for an athlete based on their club.
 * Format: {CLUB_PREFIX}-{SEQUENCE}
 * Example: BJC-001 (Bantul Judo Club)
 * 
 * @param clubId - The club ID of the athlete (null if no club assigned)
 * @returns A unique member ID string
 */
export function generateMemberId(clubId: number | null): string {
    const db = getDatabase();

    // Get club prefix
    let prefix = 'JCC'; // Default: Judo Command Center

    if (clubId !== null) {
        const club = db.prepare('SELECT name FROM clubs WHERE id = ?').get(clubId) as { name: string } | undefined;
        if (club && club.name) {
            // Extract first 3 letters of club name, uppercase
            prefix = club.name
                .replace(/[^a-zA-Z]/g, '') // Remove non-alphabetic characters
                .substring(0, 3)
                .toUpperCase();

            // Fallback if club name has less than 3 letters
            if (prefix.length < 3) {
                prefix = prefix.padEnd(3, 'X');
            }
        }
    }

    // Find max sequence number for this prefix
    const maxMemberId = db.prepare(`
        SELECT member_id 
        FROM athletes 
        WHERE member_id LIKE ? 
        ORDER BY member_id DESC 
        LIMIT 1
    `).get(`${prefix}-%`) as { member_id: string } | undefined;

    let sequence = 1;

    if (maxMemberId && maxMemberId.member_id) {
        // Extract sequence number from format "PREFIX-NNN"
        const parts = maxMemberId.member_id.split('-');
        if (parts.length === 2) {
            const lastSequence = parseInt(parts[1], 10);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }
    }

    // Format: PREFIX-NNN (zero-padded to 3 digits)
    const paddedSequence = sequence.toString().padStart(3, '0');
    return `${prefix}-${paddedSequence}`;
}

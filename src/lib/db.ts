/**
 * DB.ts is now disabled to save memory on cPanel.
 * All database queries have been migrated to src/lib/db-lite.ts 
 * using the lightweight postgres.js driver.
 */

// We export a dummy object to prevent build errors if any residual references exist,
// but all active code paths should now use the 'sql' export from db-lite.ts.

const prisma = {} as any;

export { prisma };

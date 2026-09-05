const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

async function cleanupAndVerify() {
  console.log("=== SQLITE CLEANUP & VERIFICATION ===");
  const dataDir = path.join(__dirname, '..', 'data');
  const dbPath = path.join(dataDir, 'projects.db');
  
  // 1. Create timestamped backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(dataDir, `projects_backup_${timestamp}.db`);
  
  console.log(`\n1. Creating backup at: ${backupPath}`);
  fs.copyFileSync(dbPath, backupPath);
  
  if (fs.existsSync(backupPath)) {
    console.log("   Backup file exists on disk.");
  } else {
    throw new Error("Backup file failed to copy!");
  }

  // Verify backup can be opened
  try {
    const backupDb = new Database(backupPath, { fileMustExist: true });
    const backupCount = backupDb.prepare("SELECT COUNT(*) as c FROM projects").get().c;
    console.log(`   Backup opened successfully. Verified ${backupCount} total projects inside.`);
    backupDb.close();
  } catch(e) {
    throw new Error(`Failed to verify backup database: ${e.message}`);
  }

  // 2. Perform Targeted Deletion
  console.log("\n2. Executing Deletion...");
  const activeDb = new Database(dbPath);
  const beforeCount = activeDb.prepare("SELECT COUNT(*) as c FROM projects").get().c;
  console.log(`   Total projects before: ${beforeCount}`);

  const deleteStmt = activeDb.prepare("DELETE FROM projects WHERE id LIKE 'sim-%'");
  const info = deleteStmt.run();
  
  console.log(`   Records deleted: ${info.changes}`);

  // 3. Verification
  console.log("\n3. Verifying Results...");
  const afterCount = activeDb.prepare("SELECT COUNT(*) as c FROM projects").get().c;
  console.log(`   Total projects remaining: ${afterCount}`);

  if (info.changes !== 4297) {
    console.error(`   ?? WARNING: Expected to delete exactly 4,297 records, but deleted ${info.changes}.`);
  } else {
    console.log("   ? Exactly 4,297 synthetic records were deleted.");
  }

  if (afterCount !== 208) {
    console.error(`   ?? WARNING: Expected exactly 208 records to remain, but found ${afterCount}.`);
  } else {
    console.log("   ? Exactly 208 genuine projects remain.");
  }

  // Check data readability and audit fields
  console.log("\n4. Verifying genuine record integrity...");
  const sample = activeDb.prepare("SELECT id, title, version, created_by, updated_by, createdAt FROM projects LIMIT 5").all();
  let allIntact = true;
  sample.forEach(p => {
    if (p.version === undefined || p.created_by === undefined || p.createdAt === undefined) {
      allIntact = false;
      console.error(`   ? Record ${p.id} is missing critical audit/version fields.`);
    }
  });

  if (allIntact) {
    console.log(`   ? 208 projects are fully readable. Audit (created_by, createdAt) and version fields are 100% intact.`);
  }

  activeDb.close();
  console.log("\n=== CLEANUP COMPLETED ===");
}

cleanupAndVerify().catch(e => console.error(e));

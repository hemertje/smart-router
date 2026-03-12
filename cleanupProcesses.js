#!/usr/bin/env node

// 🧹 CLEANUP PROCESSES - STOP ALLE SMART ROUTER PROCESSSEN
// Voor het geval er toch meerdere processen draaien

const fs = require('fs');
const path = require('path');

class ProcessCleanup {
  constructor() {
    this.projectRoot = __dirname;
  }

  // 🧹 Cleanup alle processen
  cleanupAll() {
    console.log('🧹 CLEANING UP ALL SMART ROUTER PROCESSES...');
    console.log('==========================================');

    // Remove lock files
    this.removeLockFiles();

    // Kill all node processes (be careful!)
    this.killNodeProcesses();

    console.log('✅ Cleanup completed');
    console.log('🔄 Restart with: node singleIDEActivityMonitor.js');
  }

  // 🔒 Remove lock files
  removeLockFiles() {
    const lockFiles = ['ide-monitor.lock', 'scheduler.lock'];
    
    lockFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      try {
        if (fs.existsSync(filePath)) {
          const lockData = fs.readFileSync(filePath, 'utf8');
          const lockInfo = JSON.parse(lockData);
          
          // Kill the process
          try {
            process.kill(lockInfo.pid, 'SIGTERM');
            console.log(`🛑 Killed process ${lockInfo.pid} (${file})`);
          } catch (e) {
            console.log(`⚠️ Process ${lockInfo.pid} already dead (${file})`);
          }
          
          // Remove lock file
          fs.unlinkSync(filePath);
          console.log(`🗑️ Removed lock file: ${file}`);
        }
      } catch (error) {
        console.log(`⚠️ Error removing ${file}:`, error.message);
      }
    });
  }

  // 🔪 Kill all node processes
  killNodeProcesses() {
    const { exec } = require('child_process');
    
    exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️ Error killing node processes:', error.message);
      } else {
        console.log('🔪 All node processes killed');
      }
    });
  }
}

// 🧹 Run cleanup
if (require.main === module) {
  const cleanup = new ProcessCleanup();
  cleanup.cleanupAll();
}

module.exports = ProcessCleanup;

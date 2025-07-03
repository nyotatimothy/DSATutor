import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { prisma } from '../lib/prisma'

const execAsync = promisify(exec)

interface BackupConfig {
  schedule: string // Cron expression
  retention: number // Days to keep backups
  compression: boolean
  cloudStorage: {
    enabled: boolean
    provider: 'aws' | 'gcp' | 'azure' | 'local'
    bucket?: string
    path?: string
  }
}

interface BackupMetadata {
  id: string
  timestamp: Date
  size: number
  type: 'full' | 'incremental'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  error?: string
  checksum?: string
  location: string
}

class DatabaseBackup {
  private config: BackupConfig
  private backups: BackupMetadata[] = []
  private backupDir: string

  constructor(config: BackupConfig) {
    this.config = config
    this.backupDir = path.join(process.cwd(), 'backups')
    this.ensureBackupDirectory()
    this.loadBackupHistory()
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  private loadBackupHistory() {
    const historyFile = path.join(this.backupDir, 'backup-history.json')
    if (fs.existsSync(historyFile)) {
      try {
        const data = fs.readFileSync(historyFile, 'utf8')
        this.backups = JSON.parse(data)
      } catch (error) {
        console.error('Failed to load backup history:', error)
        this.backups = []
      }
    }
  }

  private saveBackupHistory() {
    const historyFile = path.join(this.backupDir, 'backup-history.json')
    try {
      fs.writeFileSync(historyFile, JSON.stringify(this.backups, null, 2))
    } catch (error) {
      console.error('Failed to save backup history:', error)
    }
  }

  async createBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupMetadata> {
    const backupId = `backup-${Date.now()}`
    const timestamp = new Date()
    const filename = `${backupId}.sqlite`
    const filepath = path.join(this.backupDir, filename)

    const backup: BackupMetadata = {
      id: backupId,
      timestamp,
      size: 0,
      type,
      status: 'pending',
      location: filepath
    }

    this.backups.push(backup)
    this.saveBackupHistory()

    try {
      backup.status = 'in_progress'
      this.saveBackupHistory()

      // Create backup using SQLite commands
      await this.performBackup(filepath)

      // Get file size
      const stats = fs.statSync(filepath)
      backup.size = stats.size

      // Calculate checksum
      backup.checksum = await this.calculateChecksum(filepath)

      // Compress if enabled
      if (this.config.compression) {
        await this.compressBackup(filepath)
      }

      // Upload to cloud storage if enabled
      if (this.config.cloudStorage.enabled) {
        await this.uploadToCloud(filepath, backupId)
      }

      backup.status = 'completed'
      this.saveBackupHistory()

      console.log(`✅ Backup completed: ${backupId} (${this.formatBytes(backup.size)})`)

      // Clean up old backups
      await this.cleanupOldBackups()

      return backup
    } catch (error) {
      backup.status = 'failed'
      backup.error = error instanceof Error ? error.message : 'Unknown error'
      this.saveBackupHistory()

      console.error(`❌ Backup failed: ${backupId}`, error)
      throw error
    }
  }

  private async performBackup(filepath: string): Promise<void> {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'prisma/dev.db'
    
    if (dbPath.includes('sqlite')) {
      // SQLite backup
      await execAsync(`sqlite3 "${dbPath}" ".backup '${filepath}'"`)
    } else {
      // For other databases, export data as JSON
      await this.exportDataAsJSON(filepath)
    }
  }

  private async exportDataAsJSON(filepath: string): Promise<void> {
    // Export all data from Prisma
    const data = {
      users: await prisma.user.findMany(),
      courses: await prisma.course.findMany(),
      topics: await prisma.topic.findMany(),
      progress: await prisma.progress.findMany(),
      attempts: await prisma.attempt.findMany(),
      payments: await prisma.payment.findMany(),
      skillAssessments: await prisma.skillAssessment.findMany(),
      notifications: await prisma.notification.findMany()
    }

    fs.writeFileSync(filepath.replace('.sqlite', '.json'), JSON.stringify(data, null, 2))
  }

  private async calculateChecksum(filepath: string): Promise<string> {
    const crypto = require('crypto')
    const hash = crypto.createHash('sha256')
    const data = fs.readFileSync(filepath)
    hash.update(data)
    return hash.digest('hex')
  }

  private async compressBackup(filepath: string): Promise<void> {
    const archiver = require('archiver')
    const output = fs.createWriteStream(`${filepath}.gz`)
    const archive = archiver('gzip', { zlib: { level: 9 } })

    return new Promise((resolve, reject) => {
      output.on('close', resolve)
      archive.on('error', reject)
      archive.pipe(output)
      archive.file(filepath, { name: path.basename(filepath) })
      archive.finalize()
    })
  }

  private async uploadToCloud(filepath: string, backupId: string): Promise<void> {
    switch (this.config.cloudStorage.provider) {
      case 'aws':
        await this.uploadToAWS(filepath, backupId)
        break
      case 'gcp':
        await this.uploadToGCP(filepath, backupId)
        break
      case 'azure':
        await this.uploadToAzure(filepath, backupId)
        break
      default:
        console.log('Cloud storage not configured')
    }
  }

  private async uploadToAWS(filepath: string, backupId: string): Promise<void> {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured')
    }

    const bucket = this.config.cloudStorage.bucket || 'dsatutor-backups'
    const key = `${this.config.cloudStorage.path || 'database'}/${backupId}.sqlite`

    await execAsync(`aws s3 cp "${filepath}" s3://${bucket}/${key}`)
  }

  private async uploadToGCP(filepath: string, backupId: string): Promise<void> {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('GCP credentials not configured')
    }

    const bucket = this.config.cloudStorage.bucket || 'dsatutor-backups'
    const key = `${this.config.cloudStorage.path || 'database'}/${backupId}.sqlite`

    await execAsync(`gsutil cp "${filepath}" gs://${bucket}/${key}`)
  }

  private async uploadToAzure(filepath: string, backupId: string): Promise<void> {
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error('Azure credentials not configured')
    }

    const container = this.config.cloudStorage.bucket || 'backups'
    const blobName = `${this.config.cloudStorage.path || 'database'}/${backupId}.sqlite`

    await execAsync(`az storage blob upload --account-name ${process.env.AZURE_STORAGE_ACCOUNT} --container-name ${container} --name ${blobName} --file "${filepath}"`)
  }

  private async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retention)

    const oldBackups = this.backups.filter(backup => 
      backup.status === 'completed' && 
      new Date(backup.timestamp) < cutoffDate
    )

    for (const backup of oldBackups) {
      try {
        // Remove local file
        if (fs.existsSync(backup.location)) {
          fs.unlinkSync(backup.location)
        }

        // Remove compressed file if exists
        const compressedPath = `${backup.location}.gz`
        if (fs.existsSync(compressedPath)) {
          fs.unlinkSync(compressedPath)
        }

        // Remove from cloud storage
        if (this.config.cloudStorage.enabled) {
          await this.removeFromCloud(backup.id)
        }

        // Remove from history
        this.backups = this.backups.filter(b => b.id !== backup.id)
        
        console.log(`🗑️ Cleaned up old backup: ${backup.id}`)
      } catch (error) {
        console.error(`Failed to cleanup backup ${backup.id}:`, error)
      }
    }

    this.saveBackupHistory()
  }

  private async removeFromCloud(backupId: string): Promise<void> {
    switch (this.config.cloudStorage.provider) {
      case 'aws':
        const bucket = this.config.cloudStorage.bucket || 'dsatutor-backups'
        const key = `${this.config.cloudStorage.path || 'database'}/${backupId}.sqlite`
        await execAsync(`aws s3 rm s3://${bucket}/${key}`)
        break
      // Add other providers as needed
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    const backup = this.backups.find(b => b.id === backupId)
    if (!backup) {
      throw new Error(`Backup ${backupId} not found`)
    }

    if (backup.status !== 'completed') {
      throw new Error(`Backup ${backupId} is not in completed state`)
    }

    console.log(`🔄 Restoring backup: ${backupId}`)

    try {
      // Download from cloud if needed
      if (this.config.cloudStorage.enabled && !fs.existsSync(backup.location)) {
        await this.downloadFromCloud(backupId, backup.location)
      }

      // Verify checksum
      const currentChecksum = await this.calculateChecksum(backup.location)
      if (currentChecksum !== backup.checksum) {
        throw new Error('Backup file checksum mismatch')
      }

      // Perform restore
      await this.performRestore(backup.location)

      console.log(`✅ Backup restored successfully: ${backupId}`)
    } catch (error) {
      console.error(`❌ Backup restore failed: ${backupId}`, error)
      throw error
    }
  }

  private async downloadFromCloud(backupId: string, filepath: string): Promise<void> {
    switch (this.config.cloudStorage.provider) {
      case 'aws':
        const bucket = this.config.cloudStorage.bucket || 'dsatutor-backups'
        const key = `${this.config.cloudStorage.path || 'database'}/${backupId}.sqlite`
        await execAsync(`aws s3 cp s3://${bucket}/${key} "${filepath}"`)
        break
      // Add other providers as needed
    }
  }

  private async performRestore(filepath: string): Promise<void> {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'prisma/dev.db'
    
    if (filepath.endsWith('.json')) {
      // Restore from JSON export
      await this.restoreFromJSON(filepath)
    } else {
      // SQLite restore
      await execAsync(`sqlite3 "${dbPath}" ".restore '${filepath}'"`)
    }
  }

  private async restoreFromJSON(filepath: string): Promise<void> {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))

    // Clear existing data
    await prisma.notification.deleteMany()
    await prisma.skillAssessment.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.attempt.deleteMany()
    await prisma.progress.deleteMany()
    await prisma.topic.deleteMany()
    await prisma.course.deleteMany()
    await prisma.user.deleteMany()

    // Restore data
    await prisma.user.createMany({ data: data.users })
    await prisma.course.createMany({ data: data.courses })
    await prisma.topic.createMany({ data: data.topics })
    await prisma.progress.createMany({ data: data.progress })
    await prisma.attempt.createMany({ data: data.attempts })
    await prisma.payment.createMany({ data: data.payments })
    await prisma.skillAssessment.createMany({ data: data.skillAssessments })
    await prisma.notification.createMany({ data: data.notifications })
  }

  getBackupHistory(): BackupMetadata[] {
    return [...this.backups].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  getBackupStats() {
    const completed = this.backups.filter(b => b.status === 'completed')
    const failed = this.backups.filter(b => b.status === 'failed')
    const totalSize = completed.reduce((sum, b) => sum + b.size, 0)

    return {
      total: this.backups.length,
      completed: completed.length,
      failed: failed.length,
      totalSize: this.formatBytes(totalSize),
      averageSize: completed.length > 0 ? this.formatBytes(totalSize / completed.length) : '0 B'
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Default backup configuration
const defaultConfig: BackupConfig = {
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: 30, // Keep backups for 30 days
  compression: true,
  cloudStorage: {
    enabled: false,
    provider: 'local'
  }
}

// Create backup instance
export const databaseBackup = new DatabaseBackup(defaultConfig)

// Schedule backup (using node-cron)
export function scheduleBackups() {
  const cron = require('node-cron')
  
  cron.schedule(defaultConfig.schedule, async () => {
    try {
      console.log('🕐 Scheduled backup starting...')
      await databaseBackup.createBackup('full')
    } catch (error) {
      console.error('Scheduled backup failed:', error)
    }
  })

  console.log(`📅 Backup scheduled: ${defaultConfig.schedule}`)
} 
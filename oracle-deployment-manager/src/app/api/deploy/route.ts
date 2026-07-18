import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbToJSON } from '@/lib/db';
import { FileEngine } from '@/lib/file-engine';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, stepId, profileId, variables, services } = body;

  try {
    if (action === 'executeStep') {
      // Simulate step execution with real file operations
      switch (stepId) {
        case 'backup': {
          // Backup Oracle config files
          const files = ['tnsnames.ora', 'formsweb.cfg', 'default.env', 'sqlnet.ora'];
          for (const file of files) {
            const filePath = `C:\\oracle\\network\\admin\\${file}`;
            const exists = await FileEngine.exists(filePath);
            if (exists) {
              await FileEngine.backupFile(filePath);
            }
          }
          break;
        }
        case 'copy': {
          // Create destination directories
          if (variables?.FORMS_PATH) {
            await FileEngine.createDirectory(variables.FORMS_PATH);
          }
          if (variables?.REPORTS_PATH) {
            await FileEngine.createDirectory(variables.REPORTS_PATH);
          }
          break;
        }
        case 'variables': {
          // Replace variables in config files
          const filePath = `C:\\oracle\\network\\admin\\tnsnames.ora`;
          const exists = await FileEngine.exists(filePath);
          if (exists && variables) {
            for (const [key, value] of Object.entries(variables)) {
              if (value) {
                try {
                  await FileEngine.replaceInFile(filePath, `{{${key}}}`, value as string);
                } catch {}
              }
            }
          }
          break;
        }
        case 'environment': {
          // Environment files configuration
          const envFiles = ['default.env', 'ONYXW.env', 'ONYXWPOS.env'];
          for (const file of envFiles) {
            const filePath = `C:\\oracle\\forms\\${file}`;
            const exists = await FileEngine.exists(filePath);
            if (!exists) {
              await FileEngine.writeFile(filePath, `# Environment Configuration\n`);
            }
          }
          break;
        }
        case 'webutil': {
          // WebUtil installation placeholder
          break;
        }
        case 'jar': {
          // JAR installation placeholder
          break;
        }
        case 'restart': {
          // Services restart placeholder (no actual restart in dev)
          break;
        }
      }

      // Log to database
      try {
        const db = getDb();
        db.prepare(
          'INSERT INTO logs (id, level, message, source) VALUES (?, ?, ?, ?)'
        ).run(crypto.randomUUID(), 'success', `Step ${stepId} completed`, 'Deployment');
      } catch {}

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

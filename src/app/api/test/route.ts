import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET() {
  try {
    let ctx = null;
    let envKeys = [];
    let processEnvKeys = [];
    let school_db_in_process = !!(process.env as any).school_db;
    let d1_keys = [];
    
    try {
      ctx = getCloudflareContext();
      if (ctx?.env) {
        envKeys = Object.keys(ctx.env);
        if (ctx.env.school_db) {
           d1_keys = Object.keys(ctx.env.school_db);
        }
      }
    } catch (e) {}

    processEnvKeys = Object.keys(process.env).filter(k => k.includes('school') || k.includes('db'));

    return NextResponse.json({
      hasCtx: !!ctx,
      envKeys,
      processEnvKeys,
      school_db_in_process,
      d1_keys
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

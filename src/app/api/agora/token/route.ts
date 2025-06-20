import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

export async function POST(req: Request) {
  try {
    if (!appId || !appCertificate) {
      return NextResponse.json({ error: 'Agora App ID or Certificate not set' }, { status: 500 });
    }
    const { channelName, uid, role } = await req.json();
    if (!channelName) {
      return NextResponse.json({ error: 'Missing channelName' }, { status: 400 });
    }
    // Default to audience if not specified
    const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const agoraUid = uid || 0;
    const expireTimeSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTimestamp + expireTimeSeconds;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      agoraUid,
      agoraRole,
      privilegeExpireTs
    );
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json({ error: 'Error generating token' }, { status: 500 });
  }
} 
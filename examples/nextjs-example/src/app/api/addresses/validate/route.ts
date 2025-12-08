import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateAddress } from '@/lib/services';
import { Address } from '@/types';

/**
 * POST /api/addresses/validate
 * Validate an address without saving it
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const addressData = body as Address;

    const validation = await validateAddress(addressData);

    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      address: validation.valid ? addressData : undefined
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

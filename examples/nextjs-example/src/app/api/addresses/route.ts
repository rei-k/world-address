import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { addressService, validateAddress } from '@/lib/services';
import { Address } from '@/types';

/**
 * GET /api/addresses
 * List all addresses for the authenticated user
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const addresses = addressService.getAll(session.user.id);

  return NextResponse.json({
    addresses,
    count: addresses.length
  });
}

/**
 * POST /api/addresses
 * Create a new address
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const addressData = body as Address;

    // Validate the address
    const validation = await validateAddress(addressData);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation Error', errors: validation.errors },
        { status: 400 }
      );
    }

    // Create the address
    const address = await addressService.create(addressData, session.user.id);

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

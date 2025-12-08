import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { addressService, validateAddress } from '@/lib/services';
import { Address } from '@/types';

/**
 * GET /api/addresses/[id]
 * Get a specific address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const address = addressService.getById(params.id, session.user.id);

  if (!address) {
    return NextResponse.json(
      { error: 'Not Found', message: `Address with ID ${params.id} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(address);
}

/**
 * PUT /api/addresses/[id]
 * Update an address
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates = body as Partial<Address>;

    // Validate the updates
    const validation = await validateAddress(updates);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation Error', errors: validation.errors },
        { status: 400 }
      );
    }

    // Update the address
    const address = await addressService.update(params.id, updates, session.user.id);

    if (!address) {
      return NextResponse.json(
        { error: 'Not Found', message: `Address with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/addresses/[id]
 * Delete an address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await addressService.delete(params.id, session.user.id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Not Found', message: `Address with ID ${params.id} not found` },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}

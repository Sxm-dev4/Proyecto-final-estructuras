import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { ProductVariant, UpdateVariantDTO } from '@/types';

/**
 * GET /api/products/[id]/variants/[variantId]
 * Obtiene una variante específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const db = getAdminDB();
    const variantDoc = await db.collection('productVariants').doc(variantId).get();

    if (!variantDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Variante no encontrada',
        },
        { status: 404 }
      );
    }

    const variant: ProductVariant = serializeFirestoreData({
      id: variantDoc.id,
      ...variantDoc.data(),
    });

    return NextResponse.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la variante',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id]/variants/[variantId]
 * Actualiza una variante
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body: UpdateVariantDTO = await request.json();

    const db = getAdminDB();
    const variantRef = db.collection('productVariants').doc(variantId);
    const variantDoc = await variantRef.get();

    if (!variantDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Variante no encontrada',
        },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      updatedAt: now(),
    };

    if (body.sku !== undefined) updateData.sku = body.sku.trim().toUpperCase();
    if (body.size !== undefined) updateData.size = body.size.trim();
    if (body.color !== undefined) updateData.color = body.color.trim();
    if (body.priceAdjustment !== undefined) updateData.priceAdjustment = body.priceAdjustment;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.active !== undefined) updateData.active = body.active;

    // Si se está actualizando el SKU, verificar que no exista
    if (body.sku) {
      const existingVariant = await db
        .collection('productVariants')
        .where('sku', '==', body.sku.trim().toUpperCase())
        .get();

      if (!existingVariant.empty && existingVariant.docs[0].id !== variantId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe una variante con ese SKU',
          },
          { status: 400 }
        );
      }
    }

    await variantRef.update(updateData);

    const updatedDoc = await variantRef.get();
    const updatedVariant: ProductVariant = serializeFirestoreData({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });

    return NextResponse.json({
      success: true,
      data: updatedVariant,
    });
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar la variante',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]/variants/[variantId]
 * Elimina una variante
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const db = getAdminDB();
    const variantRef = db.collection('productVariants').doc(variantId);
    const variantDoc = await variantRef.get();

    if (!variantDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Variante no encontrada',
        },
        { status: 404 }
      );
    }

    await variantRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Variante eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar la variante',
      },
      { status: 500 }
    );
  }
}
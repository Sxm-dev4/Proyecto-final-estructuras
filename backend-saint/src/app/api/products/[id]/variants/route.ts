import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { ProductVariant, CreateVariantDTO } from '@/types';

/**
 * GET /api/products/[id]/variants
 * Obtiene todas las variantes de un producto
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDB();

    // Verificar que el producto existe
    const productDoc = await db.collection('products').doc(id).get();
    if (!productDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado',
        },
        { status: 404 }
      );
    }

    // Obtener variantes
    const variantsSnapshot = await db
      .collection('productVariants')
      .where('productId', '==', id)
      .orderBy('size', 'asc')
      .get();

    const variants: ProductVariant[] = [];
    variantsSnapshot.forEach((doc) => {
      variants.push(serializeFirestoreData({ id: doc.id, ...doc.data() }));
    });

    return NextResponse.json({
      success: true,
      data: variants,
      count: variants.length,
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener variantes',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/variants
 * Crea una nueva variante para un producto
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body: CreateVariantDTO = await request.json();

    // Validaciones básicas
    if (!body.sku || body.sku.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'El SKU es requerido',
        },
        { status: 400 }
      );
    }

    if (!body.size || !body.color) {
      return NextResponse.json(
        {
          success: false,
          error: 'Talla y color son requeridos',
        },
        { status: 400 }
      );
    }

    if (body.stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'El stock no puede ser negativo',
        },
        { status: 400 }
      );
    }

    const db = getAdminDB();

    // Verificar que el producto existe
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado',
        },
        { status: 404 }
      );
    }

    // Verificar que el SKU no exista
    const existingVariant = await db
      .collection('productVariants')
      .where('sku', '==', body.sku.trim())
      .get();

    if (!existingVariant.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe una variante con ese SKU',
        },
        { status: 400 }
      );
    }

    // Crear la variante
    const variantData = {
      productId,
      sku: body.sku.trim().toUpperCase(),
      size: body.size.trim(),
      color: body.color.trim(),
      priceAdjustment: body.priceAdjustment || 0,
      stock: body.stock,
      active: body.active !== undefined ? body.active : true,
      createdAt: now(),
      updatedAt: now(),
    };

    const docRef = await db.collection('productVariants').add(variantData);
    const newVariant: ProductVariant = serializeFirestoreData({
      id: docRef.id,
      ...variantData,
    });

    return NextResponse.json(
      {
        success: true,
        data: newVariant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la variante',
      },
      { status: 500 }
    );
  }
}
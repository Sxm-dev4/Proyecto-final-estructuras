import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData, generateSlug } from '@/lib/firestore/utils';
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

    // Verificar que el producto exista
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

    // Obtener todas las variantes del producto
    const variantsSnapshot = await db
      .collection('products')
      .doc(id)
      .collection('variants')
      .orderBy('createdAt', 'desc')
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
        error: 'Error al obtener las variantes',
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
    const { id } = await params;
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

    if (!body.size || body.size.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'La talla es requerida',
        },
        { status: 400 }
      );
    }

    if (!body.color || body.color.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'El color es requerido',
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

    // Verificar que el producto exista
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

    const skuUpperCase = body.sku.trim().toUpperCase();

    // Verificar que el SKU no exista en ninguna variante de ningún producto
    const productsSnapshot = await db.collection('products').get();
    
    for (const productDocItem of productsSnapshot.docs) {
      const variantsSnapshot = await db
        .collection('products')
        .doc(productDocItem.id)
        .collection('variants')
        .where('sku', '==', skuUpperCase)
        .get();

      if (!variantsSnapshot.empty) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe una variante con ese SKU',
          },
          { status: 400 }
        );
      }
    }

    // Crear la variante
    const variantData = {
      productId: id,
      sku: skuUpperCase,
      size: body.size.trim(),
      color: body.color.trim(),
      priceAdjustment: body.priceAdjustment || 0,
      stock: body.stock,
      active: body.active !== undefined ? body.active : true,
      createdAt: now(),
      updatedAt: now(),
    };

    const variantRef = await db
      .collection('products')
      .doc(id)
      .collection('variants')
      .add(variantData);

    const newVariant: ProductVariant = serializeFirestoreData({
      id: variantRef.id,
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
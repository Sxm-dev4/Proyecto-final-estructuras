import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { Product, UpdateProductDTO } from '@/types';

/**
 * GET /api/products/[id]
 * Obtiene un producto por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDB();
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

    const product: Product = serializeFirestoreData({
      id: productDoc.id,
      ...productDoc.data(),
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el producto',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id]
 * Actualiza un producto
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateProductDTO = await request.json();

    const db = getAdminDB();
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado',
        },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      updatedAt: now(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.active !== undefined) updateData.active = body.active;

    // Si se está actualizando la categoría, verificar que exista
    if (body.categoryId) {
      const categoryDoc = await db.collection('categories').doc(body.categoryId).get();
      if (!categoryDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'La categoría no existe',
          },
          { status: 400 }
        );
      }
    }

    // Si se está actualizando el slug, verificar que no exista
    if (body.slug) {
      const existingProduct = await db
        .collection('products')
        .where('slug', '==', body.slug)
        .get();

      if (!existingProduct.empty && existingProduct.docs[0].id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe un producto con ese slug',
          },
          { status: 400 }
        );
      }
    }

    await productRef.update(updateData);

    const updatedDoc = await productRef.get();
    const updatedProduct: Product = serializeFirestoreData({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el producto',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Elimina un producto y sus variantes
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDB();
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado',
        },
        { status: 404 }
      );
    }

    // Eliminar todas las variantes del producto
    const variantsSnapshot = await db
      .collection('productVariants')
      .where('productId', '==', id)
      .get();

    const batch = db.batch();
    variantsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Eliminar el producto
    batch.delete(productRef);

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Producto y sus variantes eliminados exitosamente',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar el producto',
      },
      { status: 500 }
    );
  }
}
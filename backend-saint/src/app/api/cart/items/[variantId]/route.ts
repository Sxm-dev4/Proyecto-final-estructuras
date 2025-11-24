import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { UpdateCartItemDTO, CartItem } from '@/types';

/**
 * PATCH /api/cart/items/[variantId]
 * Actualiza la cantidad de un item en el carrito
 * 
 * Body: {
 *   quantity: number
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const userId = request.headers.get('x-user-id') || 'test-user-123';
    const body: UpdateCartItemDTO = await request.json();

    // Validaciones
    if (body.quantity === undefined || body.quantity < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'La cantidad debe ser mayor o igual a 0',
        },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Carrito no encontrado',
        },
        { status: 404 }
      );
    }

    const currentCart = cartDoc.data();
    const currentItems: CartItem[] = currentCart?.items || [];

    // Buscar el item en el carrito
    const itemIndex = currentItems.findIndex((item) => item.variantId === variantId);

    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item no encontrado en el carrito',
        },
        { status: 404 }
      );
    }

    // Si quantity es 0, eliminar el item
    if (body.quantity === 0) {
      const updatedItems = currentItems.filter((item) => item.variantId !== variantId);

      await cartRef.update({
        items: updatedItems,
        updatedAt: now(),
      });

      const updatedCartDoc = await cartRef.get();
      const updatedCart = serializeFirestoreData({
        id: updatedCartDoc.id,
        ...updatedCartDoc.data(),
      });

      return NextResponse.json({
        success: true,
        message: 'Item eliminado del carrito',
        data: updatedCart,
      });
    }

    // ========================================
    // Verificar stock disponible
    // ========================================
    const item = currentItems[itemIndex];
    
    // Buscar la variante para verificar stock
    const productsSnapshot = await db.collection('products').get();
    let variantData: any = null;

    for (const productDoc of productsSnapshot.docs) {
      const variantDoc = await db
        .collection('products')
        .doc(productDoc.id)
        .collection('variants')
        .doc(variantId)
        .get();

      if (variantDoc.exists) {
        variantData = variantDoc.data();
        break;
      }
    }

    if (!variantData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Variante no encontrada',
        },
        { status: 404 }
      );
    }

    if (variantData.stock < body.quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Stock insuficiente. Disponible: ${variantData.stock}`,
        },
        { status: 400 }
      );
    }

    // ========================================
    // Actualizar cantidad
    // ========================================
    const updatedItems = [...currentItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: body.quantity,
    };

    await cartRef.update({
      items: updatedItems,
      updatedAt: now(),
    });

    const updatedCartDoc = await cartRef.get();
    const updatedCart = serializeFirestoreData({
      id: updatedCartDoc.id,
      ...updatedCartDoc.data(),
    });

    return NextResponse.json({
      success: true,
      message: 'Cantidad actualizada',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el item',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items/[variantId]
 * Elimina un item específico del carrito
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const userId = request.headers.get('x-user-id') || 'test-user-123';

    const db = getAdminDB();
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Carrito no encontrado',
        },
        { status: 404 }
      );
    }

    const currentCart = cartDoc.data();
    const currentItems: CartItem[] = currentCart?.items || [];

    // Verificar si el item existe
    const itemExists = currentItems.some((item) => item.variantId === variantId);

    if (!itemExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item no encontrado en el carrito',
        },
        { status: 404 }
      );
    }

    // Eliminar el item
    const updatedItems = currentItems.filter((item) => item.variantId !== variantId);

    await cartRef.update({
      items: updatedItems,
      updatedAt: now(),
    });

    const updatedCartDoc = await cartRef.get();
    const updatedCart = serializeFirestoreData({
      id: updatedCartDoc.id,
      ...updatedCartDoc.data(),
    });

    return NextResponse.json({
      success: true,
      message: 'Item eliminado del carrito',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar el item',
      },
      { status: 500 }
    );
  }
}
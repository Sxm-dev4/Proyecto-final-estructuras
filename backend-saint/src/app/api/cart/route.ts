import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { Cart } from '@/types';

/**
 * GET /api/cart
 * Obtiene el carrito del usuario autenticado
 * 
 * NOTA: Por ahora usamos un userId hardcodeado.
 * En Fase 7 (Auth) obtendremos el userId del token de Firebase Auth.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'test-user-123';

    const db = getAdminDB();
    const cartDoc = await db.collection('carts').doc(userId).get();

    if (!cartDoc.exists) {
      // Si no existe carrito, crearlo vacío
      const emptyCart = {
        userId,
        items: [],
        createdAt: now(),
        updatedAt: now(),
      };

      await db.collection('carts').doc(userId).set(emptyCart);

      return NextResponse.json({
        success: true,
        data: serializeFirestoreData({ id: userId, ...emptyCart }),
      });
    }

    const cart: Cart = serializeFirestoreData({
      id: cartDoc.id,
      ...cartDoc.data(),
    });

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el carrito',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Limpia completamente el carrito del usuario
 */
export async function DELETE(request: NextRequest) {
  try {
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

    // Vaciar el array de items
    await cartRef.update({
      items: [],
      updatedAt: now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Carrito limpiado exitosamente',
      data: {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al limpiar el carrito',
      },
      { status: 500 }
    );
  }
}
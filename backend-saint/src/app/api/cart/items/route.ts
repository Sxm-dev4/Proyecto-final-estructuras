import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { AddToCartDTO, CartItem } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/cart/items
 * Agrega un item al carrito (o incrementa la cantidad si ya existe)
 * 
 * Body: {
 *   variantId: string,
 *   quantity: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'test-user-123';
    const body: AddToCartDTO = await request.json();

    // Validaciones
    if (!body.variantId || body.variantId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'El ID de la variante es requerido',
        },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'La cantidad debe ser mayor a 0',
        },
        { status: 400 }
      );
    }

    const db = getAdminDB();

    // ========================================
    // 1. Buscar la variante en todas las subcolecciones
    // ========================================
    let variantData: any = null;
    let productId: string | null = null;

    const productsSnapshot = await db.collection('products').get();

    for (const productDoc of productsSnapshot.docs) {
      const variantDoc = await db
        .collection('products')
        .doc(productDoc.id)
        .collection('variants')
        .doc(body.variantId)
        .get();

      if (variantDoc.exists) {
        variantData = variantDoc.data();
        productId = productDoc.id;
        break;
      }
    }

    if (!variantData || !productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Variante no encontrada',
        },
        { status: 404 }
      );
    }

    // Verificar que la variante esté activa
    if (!variantData.active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Esta variante no está disponible',
        },
        { status: 400 }
      );
    }

    // Verificar stock disponible
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
    // 2. Obtener información del producto
    // ========================================
    const productDoc = await db.collection('products').doc(productId).get();
    const productData = productDoc.data();

    if (!productData || !productData.active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Este producto no está disponible',
        },
        { status: 400 }
      );
    }

    // ========================================
    // 3. Calcular precio final
    // ========================================
    const finalPrice = productData.basePrice + (variantData.priceAdjustment || 0);

    // ========================================
    // 4. Obtener o crear el carrito
    // ========================================
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Crear carrito nuevo
      await cartRef.set({
        userId,
        items: [],
        createdAt: now(),
        updatedAt: now(),
      });
    }

    // ========================================
    // 5. Obtener items actuales del carrito
    // ========================================
    const currentCart = cartDoc.exists ? cartDoc.data() : { items: [] };
    const currentItems: CartItem[] = currentCart?.items || [];

    // ========================================
    // 6. Verificar si el item ya existe en el carrito
    // ========================================
    const existingItemIndex = currentItems.findIndex(
      (item) => item.variantId === body.variantId
    );

    let updatedItems: CartItem[];

    if (existingItemIndex !== -1) {
      // Item ya existe, incrementar cantidad
      const existingItem = currentItems[existingItemIndex];
      const newQuantity = existingItem.quantity + body.quantity;

      // Verificar stock para la nueva cantidad
      if (variantData.stock < newQuantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Stock insuficiente. Ya tienes ${existingItem.quantity} en el carrito. Disponible: ${variantData.stock}`,
          },
          { status: 400 }
        );
      }

      // Actualizar cantidad
      updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };
    } else {
      // Item nuevo, agregarlo
      const newItem: CartItem = {
        variantId: body.variantId,
        productId: productId,
        quantity: body.quantity,
        productName: productData.name,
        size: variantData.size,
        color: variantData.color,
        price: finalPrice,
        imageUrl: productData.images?.[0] || '',
      };

      updatedItems = [...currentItems, newItem];
    }

    // ========================================
    // 7. Actualizar el carrito en Firestore
    // ========================================
    await cartRef.update({
      items: updatedItems,
      updatedAt: now(),
    });

    // ========================================
    // 8. Obtener carrito actualizado
    // ========================================
    const updatedCartDoc = await cartRef.get();
    const updatedCart = serializeFirestoreData({
      id: updatedCartDoc.id,
      ...updatedCartDoc.data(),
    });

    return NextResponse.json({
      success: true,
      message: 'Producto agregado al carrito',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al agregar al carrito',
      },
      { status: 500 }
    );
  }
}
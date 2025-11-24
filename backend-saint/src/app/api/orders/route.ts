import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData, generateOrderNumber } from '@/lib/firestore/utils';
import { Order, OrderItem, CreateOrderDTO, Cart, CartItem } from '@/types';

/**
 * GET /api/orders
 * Obtiene todas las órdenes del usuario autenticado
 * Query params: status, limit
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'test-user-123';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getAdminDB();
    let query = db
      .collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    // Filtrar por estado si se especifica
    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const snapshot = await query.limit(limit).get();

    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push(serializeFirestoreData({ id: doc.id, ...doc.data() }));
    });

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las órdenes',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Crea una nueva orden desde el carrito del usuario (checkout)
 * 
 * Body: {
 *   shippingAddress: Address,
 *   paymentMethod: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'test-user-123';
    const body: CreateOrderDTO = await request.json();

    // ========================================
    // 1. Validaciones básicas
    // ========================================
    if (!body.shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'La dirección de envío es requerida',
        },
        { status: 400 }
      );
    }

    if (!body.shippingAddress.street || !body.shippingAddress.city) {
      return NextResponse.json(
        {
          success: false,
          error: 'La dirección de envío está incompleta',
        },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: 'El método de pago es requerido',
        },
        { status: 400 }
      );
    }

    const db = getAdminDB();

    // ========================================
    // 2. Obtener el carrito del usuario
    // ========================================
    const cartDoc = await db.collection('carts').doc(userId).get();

    if (!cartDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontró el carrito',
        },
        { status: 404 }
      );
    }

    const cart: Cart = cartDoc.data() as Cart;

    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'El carrito está vacío',
        },
        { status: 400 }
      );
    }

    // ========================================
    // 3. Validar stock y preparar items de la orden
    // ========================================
    const orderItems: OrderItem[] = [];
    const variantsToUpdate: Array<{
      productId: string;
      variantId: string;
      newStock: number;
    }> = [];

    for (const cartItem of cart.items) {
      // Buscar la variante para verificar stock actual
      const productsSnapshot = await db.collection('products').get();
      let variantData: any = null;
      let productId: string | null = null;

      for (const productDoc of productsSnapshot.docs) {
        const variantDoc = await db
          .collection('products')
          .doc(productDoc.id)
          .collection('variants')
          .doc(cartItem.variantId)
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
            error: `La variante ${cartItem.variantId} no existe`,
          },
          { status: 400 }
        );
      }

      // Verificar que esté activa
      if (!variantData.active) {
        return NextResponse.json(
          {
            success: false,
            error: `El producto "${cartItem.productName}" ya no está disponible`,
          },
          { status: 400 }
        );
      }

      // Verificar stock suficiente
      if (variantData.stock < cartItem.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Stock insuficiente para "${cartItem.productName}" (${cartItem.size}, ${cartItem.color}). Disponible: ${variantData.stock}, solicitado: ${cartItem.quantity}`,
          },
          { status: 400 }
        );
      }

      // Preparar item de la orden
      const orderItem: OrderItem = {
        variantId: cartItem.variantId,
        productId: productId,
        quantity: cartItem.quantity,
        productName: cartItem.productName,
        size: cartItem.size,
        color: cartItem.color,
        priceAtPurchase: cartItem.price,
        imageUrl: cartItem.imageUrl,
      };

      orderItems.push(orderItem);

      // Preparar actualización de stock
      variantsToUpdate.push({
        productId,
        variantId: cartItem.variantId,
        newStock: variantData.stock - cartItem.quantity,
      });
    }

    // ========================================
    // 4. Calcular totales
    // ========================================
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    // Configuración de impuestos y envío (puedes ajustar según tu país)
    const taxRate = 0.19; // 19% IVA (Colombia)
    const tax = Math.round(subtotal * taxRate);
    const shipping = subtotal >= 10000 ? 0 : 5000; // Envío gratis sobre $100 USD
    const total = subtotal + tax + shipping;

    // ========================================
    // 5. Crear la orden usando una transacción (Batch Write)
    // ========================================
    const batch = db.batch();
    const orderNumber = generateOrderNumber();

    // Crear documento de orden
    const orderRef = db.collection('orders').doc();
    const orderData = {
      userId,
      orderNumber,
      status: 'pending' as const,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      currency: 'COP', // Puedes hacerlo dinámico
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      createdAt: now(),
      updatedAt: now(),
    };

    batch.set(orderRef, orderData);

    // Actualizar stock de cada variante
    for (const variantUpdate of variantsToUpdate) {
      const variantRef = db
        .collection('products')
        .doc(variantUpdate.productId)
        .collection('variants')
        .doc(variantUpdate.variantId);

      batch.update(variantRef, {
        stock: variantUpdate.newStock,
        updatedAt: now(),
      });
    }

    // Vaciar el carrito
    const cartRef = db.collection('carts').doc(userId);
    batch.update(cartRef, {
      items: [],
      updatedAt: now(),
    });

    // Ejecutar todas las operaciones de forma atómica
    await batch.commit();

    // ========================================
    // 6. Obtener la orden creada
    // ========================================
    const createdOrderDoc = await orderRef.get();
    const createdOrder: Order = serializeFirestoreData({
      id: createdOrderDoc.id,
      ...createdOrderDoc.data(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Orden creada exitosamente',
        data: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la orden',
      },
      { status: 500 }
    );
  }
}
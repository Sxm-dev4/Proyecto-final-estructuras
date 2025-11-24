import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { Order, UpdateOrderStatusDTO, OrderStatus } from '@/types';

/**
 * GET /api/orders/[id]
 * Obtiene los detalles de una orden específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'test-user-123';

    const db = getAdminDB();
    const orderDoc = await db.collection('orders').doc(id).get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Orden no encontrada',
        },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    // Verificar que la orden pertenezca al usuario
    // (En un sistema real, los admins podrían ver todas las órdenes)
    if (orderData?.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No tienes permiso para ver esta orden',
        },
        { status: 403 }
      );
    }

    const order: Order = serializeFirestoreData({
      id: orderDoc.id,
      ...orderData,
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la orden',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Actualiza el estado de una orden
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateOrderStatusDTO = await request.json();

    // Validar que el estado sea válido
    const validStatuses: OrderStatus[] = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Orden no encontrada',
        },
        { status: 404 }
      );
    }

    const currentOrderData = orderDoc.data();

    // ========================================
    // Validar transiciones de estado
    // ========================================
    const currentStatus = currentOrderData?.status;

    // No permitir cambiar estado de órdenes canceladas o entregadas
    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede cambiar el estado de una orden ${currentStatus === 'cancelled' ? 'cancelada' : 'entregada'}`,
        },
        { status: 400 }
      );
    }

    // Si se está cancelando, restaurar stock
    if (body.status === 'cancelled' && currentStatus !== 'cancelled') {
      const orderItems = currentOrderData?.items || [];
      const batch = db.batch();

      for (const item of orderItems) {
        // Buscar la variante para restaurar stock
        const productsSnapshot = await db.collection('products').get();
        let variantFound = false;

        for (const productDoc of productsSnapshot.docs) {
          const variantDoc = await db
            .collection('products')
            .doc(productDoc.id)
            .collection('variants')
            .doc(item.variantId)
            .get();

          if (variantDoc.exists) {
            const variantData = variantDoc.data();
            
            // Validación adicional para TypeScript
            if (!variantData) {
              console.error(`Variante ${item.variantId} no tiene datos`);
              continue;
            }

            const variantRef = db
              .collection('products')
              .doc(productDoc.id)
              .collection('variants')
              .doc(item.variantId);

            // Restaurar stock
            batch.update(variantRef, {
              stock: (variantData.stock || 0) + item.quantity, // ✅ Manejo seguro
              updatedAt: now(),
            });
            
            variantFound = true;
            break;
          }
        }

        //  Log si no se encuentra la variante (para debugging)
        if (!variantFound) {
          console.warn(`No se encontró la variante ${item.variantId} para restaurar stock`);
        }
      }

      // Actualizar estado de la orden
      batch.update(orderRef, {
        status: body.status,
        updatedAt: now(),
      });

      await batch.commit();
    } else {
      // Actualizar solo el estado
      await orderRef.update({
        status: body.status,
        updatedAt: now(),
      });
    }

    // ========================================
    // Obtener orden actualizada
    // ========================================
    const updatedOrderDoc = await orderRef.get();
    const updatedOrder: Order = serializeFirestoreData({
      id: updatedOrderDoc.id,
      ...updatedOrderDoc.data(),
    });

    return NextResponse.json({
      success: true,
      message: 'Estado de la orden actualizado',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar la orden',
      },
      { status: 500 }
    );
  }
}
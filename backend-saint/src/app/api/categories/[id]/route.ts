import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData } from '@/lib/firestore/utils';
import { Category, UpdateCategoryDTO } from '@/types';

/**
 * GET /api/categories/[id]
 * Obtiene una categoría por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDB();
    const categoryDoc = await db.collection('categories').doc(id).get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría no encontrada',
        },
        { status: 404 }
      );
    }

    const category: Category = serializeFirestoreData({
      id: categoryDoc.id,
      ...categoryDoc.data(),
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la categoría',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/categories/[id]
 * Actualiza una categoría
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateCategoryDTO = await request.json();

    const db = getAdminDB();
    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría no encontrada',
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
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    // Si se está actualizando el slug, verificar que no exista
    if (body.slug) {
      const existingCategory = await db
        .collection('categories')
        .where('slug', '==', body.slug)
        .get();

      if (!existingCategory.empty && existingCategory.docs[0].id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe una categoría con ese slug',
          },
          { status: 400 }
        );
      }
    }

    await categoryRef.update(updateData);

    const updatedDoc = await categoryRef.get();
    const updatedCategory: Category = serializeFirestoreData({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar la categoría',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Elimina una categoría
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDB();
    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría no encontrada',
        },
        { status: 404 }
      );
    }

    // Verificar si hay productos asociados a esta categoría
    const productsSnapshot = await db
      .collection('products')
      .where('categoryId', '==', id)
      .limit(1)
      .get();

    if (!productsSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se puede eliminar una categoría con productos asociados',
        },
        { status: 400 }
      );
    }

    await categoryRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar la categoría',
      },
      { status: 500 }
    );
  }
}
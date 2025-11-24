import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData, generateSlug } from '@/lib/firestore/utils';
import { Category, CreateCategoryDTO } from '@/types';

/**
 * GET /api/categories
 * Obtiene todas las categorías con filtros opcionales
 * Query params: active
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get('active');

    const db = getAdminDB();
    let query = db.collection('categories').orderBy('order', 'asc'); // ✅ Ordenar por 'order'

    // Filtrar por categorías activas si se especifica
    if (activeParam !== null) {
      query = query.where('active', '==', activeParam === 'true') as any;
    }

    const snapshot = await query.get();

    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      categories.push(serializeFirestoreData({ id: doc.id, ...doc.data() }));
    });

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener categorías',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Crea una nueva categoría
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryDTO = await request.json();

    // Validaciones básicas
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'El nombre de la categoría es requerido',
        },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const categoriesRef = db.collection('categories');

    // Generar slug si no viene en el body
    const slug = body.slug || generateSlug(body.name);

    // Verificar que el slug no exista
    const existingCategory = await categoriesRef.where('slug', '==', slug).get();
    if (!existingCategory.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe una categoría con ese slug',
        },
        { status: 400 }
      );
    }

    // Cear la categoría con los nuevos campos
    const categoryData = {
      name: body.name.trim(),
      slug,
      description: body.description || '',
      imageUrl: body.imageUrl || '',
      order: body.order !== undefined ? body.order : 999, // Valor por defecto
      active: body.active !== undefined ? body.active : true, // Activa por defecto
      createdAt: now(),
      updatedAt: now(),
    };

    const docRef = await categoriesRef.add(categoryData);
    const newCategory: Category = serializeFirestoreData({
      id: docRef.id,
      ...categoryData,
    });

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la categoría',
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDB } from '@/lib/firebase/admin';
import { now, serializeFirestoreData, generateSlug } from '@/lib/firestore/utils';
import { Product, CreateProductDTO } from '@/types';

/**
 * GET /api/products
 * Obtiene todos los productos con filtros opcionales
 * Query params: categoryId, featured, active, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getAdminDB();
    let query = db.collection('products').orderBy('createdAt', 'desc');

    // Aplicar filtros
    if (categoryId) {
      query = query.where('categoryId', '==', categoryId) as any;
    }
    if (featured !== null) {
      query = query.where('featured', '==', featured === 'true') as any;
    }
    if (active !== null) {
      query = query.where('active', '==', active === 'true') as any;
    }

    const snapshot = await query.limit(limit).get();

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push(serializeFirestoreData({ id: doc.id, ...doc.data() }));
    });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener productos',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Crea un nuevo producto
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductDTO = await request.json();

    // Validaciones básicas
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'El nombre del producto es requerido',
        },
        { status: 400 }
      );
    }

    if (!body.categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'La categoría es requerida',
        },
        { status: 400 }
      );
    }

    if (body.basePrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'El precio debe ser mayor a 0',
        },
        { status: 400 }
      );
    }

    const db = getAdminDB();

    // Verificar que la categoría exista
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

    // Generar slug si no viene en el body
    const slug = body.slug || generateSlug(body.name);

    // Verificar que el slug no exista
    const existingProduct = await db
      .collection('products')
      .where('slug', '==', slug)
      .get();

    if (!existingProduct.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe un producto con ese slug',
        },
        { status: 400 }
      );
    }

    // Crear el producto
    const productData = {
      name: body.name.trim(),
      slug,
      description: body.description || '',
      categoryId: body.categoryId,
      basePrice: body.basePrice,
      currency: body.currency || 'COP',
      images: body.images || [],
      featured: body.featured || false,
      active: body.active !== undefined ? body.active : true,
      createdAt: now(),
      updatedAt: now(),
    };

    const docRef = await db.collection('products').add(productData);
    const newProduct: Product = serializeFirestoreData({
      id: docRef.id,
      ...productData,
    });

    return NextResponse.json(
      {
        success: true,
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear el producto',
      },
      { status: 500 }
    );
  }
}
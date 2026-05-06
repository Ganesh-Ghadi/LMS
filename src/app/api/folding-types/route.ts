import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { paginate } from "@/lib/paginate";
import { z } from "zod";

const createSchema = z.object({
  foldingTypeName: z.string().min(1, "Folding type name is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
});

// GET /api/folding-types?search=&page=1&perPage=10&sort=foldingTypeName&order=asc
export async function GET(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage")) || 10));
    const search = searchParams.get("search")?.trim() || "";
    const sort = (searchParams.get("sort") || "foldingTypeName") as string;
    const order = (searchParams.get("order") === "desc" ? "desc" : "asc") as "asc" | "desc";

    // Build dynamic filter
    type FoldingTypeWhere = {
      foldingTypeName?: { contains: string };
    };
    const where: FoldingTypeWhere = {};
    
    if (search) {
      where.foldingTypeName = { contains: search };
    }

    // Allow listed sortable fields only
    const sortableFields = new Set(["foldingTypeName", "price", "createdAt"]);
    const orderBy: Record<string, "asc" | "desc"> = sortableFields.has(sort) 
      ? { [sort]: order } 
      : { foldingTypeName: "asc" };

    const result = await paginate({
      model: prisma.foldingType as any,
      where,
      orderBy,
      page,
      perPage,
      select: { 
        id: true, 
        foldingTypeName: true, 
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Success(result);
  } catch (error) {
    console.error("Get folding types error:", error);
    return Error("Failed to fetch folding types");
  }
}

// POST /api/folding-types - Create new folding type
export async function POST(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const body = await req.json();
    const { foldingTypeName, price } = createSchema.parse(body);
    
    const created = await prisma.foldingType.create({
      data: { 
        foldingTypeName,
        price 
      },
      select: { 
        id: true, 
        foldingTypeName: true, 
        price: true,
        createdAt: true,
      }
    });
    
    return Success(created, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === 'P2002') {
      return Error('Folding type name already exists', 409);
    }
    console.error("Create folding type error:", error);
    return Error("Failed to create folding type");
  }
}

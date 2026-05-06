import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { paginate } from "@/lib/paginate";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  ironingRate: z.coerce.number().min(0, "Ironing rate must be at least 0"),
  dryCleaningRate: z.coerce.number().min(0, "Dry cleaning rate must be at least 0"),
});

// GET /api/layers?search=&page=1&perPage=10&sort=name&order=asc
export async function GET(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage")) || 10));
    const search = searchParams.get("search")?.trim() || "";
    const sort = (searchParams.get("sort") || "name") as string;
    const order = (searchParams.get("order") === "desc" ? "desc" : "asc") as "asc" | "desc";

    // Build dynamic filter
    type LayerWhere = {
      name?: { contains: string };
    };
    const where: LayerWhere = {};
    
    if (search) {
      where.name = { contains: search };
    }

    // Allow listed sortable fields only
    const sortableFields = new Set(["name", "ironingRate", "dryCleaningRate", "createdAt"]);
    const orderBy: Record<string, "asc" | "desc"> = sortableFields.has(sort) 
      ? { [sort]: order } 
      : { name: "asc" };

    const result = await paginate({
      model: prisma.layer as any,
      where,
      orderBy,
      page,
      perPage,
      select: { 
        id: true, 
        name: true, 
        description: true,
        ironingRate: true,
        dryCleaningRate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Success(result);
  } catch (error) {
    console.error("Get layers error:", error);
    return Error("Failed to fetch layers");
  }
}

// POST /api/layers - Create new layer
export async function POST(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const body = await req.json();
    const { name, description, ironingRate, dryCleaningRate } = createSchema.parse(body);
    
    const created = await prisma.layer.create({
      data: { 
        name,
        description,
        ironingRate,
        dryCleaningRate 
      },
      select: { 
        id: true, 
        name: true, 
        ironingRate: true,
        dryCleaningRate: true,
        createdAt: true,
      }
    });
    
    return Success(created, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === 'P2002') {
      return Error('Layer name already exists', 409);
    }
    console.error("Create layer error:", error);
    return Error("Failed to create layer");
  }
}

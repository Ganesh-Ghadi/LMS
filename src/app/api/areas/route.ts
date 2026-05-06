import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { paginate } from "@/lib/paginate";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Area name is required"),
  cityId: z.number().int({ message: "City is required" }),
});

// GET /api/areas?search=&page=1&perPage=10&sort=name&order=asc
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
    type AreaWhere = {
      name?: { contains: string };
      cityId?: number;
    };
    const where: AreaWhere = {};
    
    if (search) {
      where.name = { contains: search };
    }
    
    const cityIdParam = searchParams.get("cityId");
    if (cityIdParam && !isNaN(Number(cityIdParam))) {
      where.cityId = Number(cityIdParam);
    }

    // Allow listed sortable fields only
    const sortableFields = new Set(["name", "createdAt"]);
    const orderBy: Record<string, "asc" | "desc"> = sortableFields.has(sort) 
      ? { [sort]: order } 
      : { name: "asc" };

    const result = await paginate({
      model: prisma.area as any,
      where,
      orderBy,
      page,
      perPage,
      select: { 
        id: true, 
        name: true, 
        createdAt: true,
        updatedAt: true,
        cityId: true,
        city: {
          select: {
            id: true,
            city: true
          }
        }
      },
    });

    return Success(result);
  } catch (error) {
    console.error("Get areas error:", error);
    return Error("Failed to fetch areas");
  }
}

// POST /api/areas - Create new area
export async function POST(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const body = await req.json();
    const { name, cityId } = createSchema.parse(body);
    
    const created = await prisma.area.create({
      data: { 
        name,
        cityId 
      },
      select: { 
        id: true, 
        name: true, 
        createdAt: true,
        cityId: true,
        city: {
          select: {
            id: true,
            city: true
          }
        }
      }
    });
    
    return Success(created, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === 'P2002') {
      return Error('Area name already exists', 409);
    }
    console.error("Create area error:", error);
    return Error("Failed to create area");
  }
}

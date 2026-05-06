import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { paginate } from "@/lib/paginate";
import { z } from "zod";

const createSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  rate: z.coerce.number().min(0.01, "Rate must be greater than 0"),
});

// GET /api/services?search=&page=1&perPage=10&sort=serviceName&order=asc
export async function GET(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage")) || 10));
    const search = searchParams.get("search")?.trim() || "";
    const sort = (searchParams.get("sort") || "serviceName") as string;
    const order = (searchParams.get("order") === "desc" ? "desc" : "asc") as "asc" | "desc";

    // Build dynamic filter
    type ServiceWhere = {
      serviceName?: { contains: string };
    };
    const where: ServiceWhere = {};
    
    if (search) {
      where.serviceName = { contains: search };
    }

    // Allow listed sortable fields only
    const sortableFields = new Set(["serviceName", "rate", "createdAt"]);
    const orderBy: Record<string, "asc" | "desc"> = sortableFields.has(sort) 
      ? { [sort]: order } 
      : { serviceName: "asc" };

    const result = await paginate({
      model: prisma.service as any,
      where,
      orderBy,
      page,
      perPage,
      select: { 
        id: true, 
        serviceName: true, 
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Success(result);
  } catch (error) {
    console.error("Get services error:", error);
    return Error("Failed to fetch services");
  }
}

// POST /api/services - Create new service
export async function POST(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const body = await req.json();
    const { serviceName, rate } = createSchema.parse(body);
    
    const created = await prisma.service.create({
      data: { 
        serviceName,
        rate 
      },
      select: { 
        id: true, 
        serviceName: true, 
        rate: true,
        createdAt: true,
      }
    });
    
    return Success(created, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === 'P2002') {
      return Error('Service name already exists', 409);
    }
    console.error("Create service error:", error);
    return Error("Failed to create service");
  }
}

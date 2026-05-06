import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { paginate } from "@/lib/paginate";
import { z } from "zod";

const createSchema = z.object({
  workName: z.string().min(1, "Work name is required"),
  rate: z.coerce.number().min(0.01, "Rate must be greater than 0"),
});

// GET /api/works?search=&page=1&perPage=10&sort=workName&order=asc
export async function GET(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage")) || 10));
    const search = searchParams.get("search")?.trim() || "";
    const sort = (searchParams.get("sort") || "workName") as string;
    const order = (searchParams.get("order") === "desc" ? "desc" : "asc") as "asc" | "desc";

    // Build dynamic filter
    type WorkWhere = {
      workName?: { contains: string };
    };
    const where: WorkWhere = {};
    
    if (search) {
      where.workName = { contains: search };
    }

    // Allow listed sortable fields only
    const sortableFields = new Set(["workName", "rate", "createdAt"]);
    const orderBy: Record<string, "asc" | "desc"> = sortableFields.has(sort) 
      ? { [sort]: order } 
      : { workName: "asc" };

    const result = await paginate({
      model: prisma.work as any,
      where,
      orderBy,
      page,
      perPage,
      select: { 
        id: true, 
        workName: true, 
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Success(result);
  } catch (error) {
    console.error("Get works error:", error);
    return Error("Failed to fetch works");
  }
}

// POST /api/works - Create new work
export async function POST(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const body = await req.json();
    const { workName, rate } = createSchema.parse(body);
    
    const created = await prisma.work.create({
      data: { 
        workName,
        rate 
      },
      select: { 
        id: true, 
        workName: true, 
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
      return Error('Work name already exists', 409);
    }
    console.error("Create work error:", error);
    return Error("Failed to create work");
  }
}

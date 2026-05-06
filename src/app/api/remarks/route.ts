import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { paginate } from "@/lib/paginate";
import { z } from "zod";

const createSchema = z.object({
  remarkName: z.string().min(1, "Remark name is required"),
});

// GET /api/remarks?search=&page=1&perPage=10&sort=remarkName&order=asc
export async function GET(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage")) || 10));
    const search = searchParams.get("search")?.trim() || "";
    const sort = (searchParams.get("sort") || "remarkName") as string;
    const order = (searchParams.get("order") === "desc" ? "desc" : "asc") as "asc" | "desc";

    // Build dynamic filter
    type RemarkWhere = {
      remarkName?: { contains: string };
    };
    const where: RemarkWhere = {};
    
    if (search) {
      where.remarkName = { contains: search };
    }

    // Allow listed sortable fields only
    const sortableFields = new Set(["remarkName", "createdAt"]);
    const orderBy: Record<string, "asc" | "desc"> = sortableFields.has(sort) 
      ? { [sort]: order } 
      : { remarkName: "asc" };

    const result = await paginate({
      model: prisma.remark as any,
      where,
      orderBy,
      page,
      perPage,
      select: { 
        id: true, 
        remarkName: true, 
        createdAt: true,
        updatedAt: true,
      },
    });

    return Success(result);
  } catch (error) {
    console.error("Get remarks error:", error);
    return Error("Failed to fetch remarks");
  }
}

// POST /api/remarks - Create new remark
export async function POST(req: NextRequest) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const body = await req.json();
    const { remarkName } = createSchema.parse(body);
    
    const created = await prisma.remark.create({
      data: { 
        remarkName,
      },
      select: { 
        id: true, 
        remarkName: true, 
        createdAt: true,
      }
    });
    
    return Success(created, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === 'P2002') {
      return Error('Remark already exists', 409);
    }
    console.error("Create remark error:", error);
    return Error("Failed to create remark");
  }
}

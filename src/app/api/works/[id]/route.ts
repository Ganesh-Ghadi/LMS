import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest, NotFound } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { z } from "zod";

const updateSchema = z.object({
  workName: z.string().min(1, "Work name is required").optional(),
  rate: z.coerce.number().min(0.01, "Rate must be greater than 0").optional(),
});

// GET /api/works/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    const work = await prisma.work.findUnique({
      where: { id },
      select: {
        id: true,
        workName: true,
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!work) return NotFound("Work not found");

    return Success(work);
  } catch (error) {
    console.error("Get work error:", error);
    return Error("Failed to fetch work");
  }
}

// PATCH /api/works/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.work.update({
      where: { id },
      data,
      select: {
        id: true,
        workName: true,
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Success(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === "P2025") {
      return NotFound("Work not found");
    }
    if (error.code === "P2002") {
      return Error("Work name already exists", 409);
    }
    console.error("Update work error:", error);
    return Error("Failed to update work");
  }
}

// DELETE /api/works/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    await prisma.work.delete({
      where: { id },
    });

    return Success({ message: "Work deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NotFound("Work not found");
    }
    console.error("Delete work error:", error);
    return Error("Failed to delete work");
  }
}

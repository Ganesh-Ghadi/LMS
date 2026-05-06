import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest, NotFound } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { z } from "zod";

const updateSchema = z.object({
  foldingTypeName: z.string().min(1, "Folding type name is required").optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0").optional(),
});

// GET /api/folding-types/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    const foldingType = await prisma.foldingType.findUnique({
      where: { id },
      select: {
        id: true,
        foldingTypeName: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!foldingType) return NotFound("Folding type not found");

    return Success(foldingType);
  } catch (error) {
    console.error("Get folding type error:", error);
    return Error("Failed to fetch folding type");
  }
}

// PATCH /api/folding-types/[id]
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

    const updated = await prisma.foldingType.update({
      where: { id },
      data,
      select: {
        id: true,
        foldingTypeName: true,
        price: true,
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
      return NotFound("Folding type not found");
    }
    if (error.code === "P2002") {
      return Error("Folding type name already exists", 409);
    }
    console.error("Update folding type error:", error);
    return Error("Failed to update folding type");
  }
}

// DELETE /api/folding-types/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    await prisma.foldingType.delete({
      where: { id },
    });

    return Success({ message: "Folding type deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NotFound("Folding type not found");
    }
    console.error("Delete folding type error:", error);
    return Error("Failed to delete folding type");
  }
}

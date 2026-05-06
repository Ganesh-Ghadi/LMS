import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest, NotFound } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional().nullable(),
  ironingRate: z.coerce.number().min(0, "Ironing rate must be at least 0").optional(),
  dryCleaningRate: z.coerce.number().min(0, "Dry cleaning rate must be at least 0").optional(),
});

// GET /api/layers/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    const layer = await prisma.layer.findUnique({
      where: { id },
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

    if (!layer) return NotFound("Layer not found");

    return Success(layer);
  } catch (error) {
    console.error("Get layer error:", error);
    return Error("Failed to fetch layer");
  }
}

// PATCH /api/layers/[id]
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

    const updated = await prisma.layer.update({
      where: { id },
      data,
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

    return Success(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === "P2025") {
      return NotFound("Layer not found");
    }
    if (error.code === "P2002") {
      return Error("Layer name already exists", 409);
    }
    console.error("Update layer error:", error);
    return Error("Failed to update layer");
  }
}

// DELETE /api/layers/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    await prisma.layer.delete({
      where: { id },
    });

    return Success({ message: "Layer deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NotFound("Layer not found");
    }
    console.error("Delete layer error:", error);
    return Error("Failed to delete layer");
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest, NotFound } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "Area name is required").optional(),
  cityId: z.number().int().optional(),
});

// GET /api/areas/[id] - Get single area
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid area ID");

    const area = await prisma.area.findUnique({
      where: { id },
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
      }
    });

    if (!area) return NotFound('Area not found');
    return Success(area);
  } catch (error) {
    console.error("Get area error:", error);
    return Error("Failed to fetch area");
  }
}

// PATCH /api/areas/[id] - Update area
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid area ID");

    const body = await req.json();
    const updateData = updateSchema.parse(body);

    if (Object.keys(updateData).length === 0) {
      return BadRequest("No valid fields to update");
    }

    const updated = await prisma.area.update({
      where: { id },
      data: updateData,
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
      }
    });

    return Success(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === 'P2025') return NotFound('Area not found');
    if (error.code === 'P2002') {
      return Error('Area name already exists', 409);
    }
    console.error("Update area error:", error);
    return Error("Failed to update area");
  }
}

// DELETE /api/areas/[id] - Delete area
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid area ID");

    await prisma.area.delete({
      where: { id }
    });

    return Success({ message: "Area deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') return NotFound('Area not found');
    if (error.code === 'P2003') {
      return Error(
        'Cannot delete this area because it is in use by other records.',
        409
      );
    }
    console.error("Delete area error:", error);
    return Error("Failed to delete area");
  }
}

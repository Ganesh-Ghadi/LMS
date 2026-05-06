import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest, NotFound } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { z } from "zod";

const updateSchema = z.object({
  remarkName: z.string().min(1, "Remark name is required").optional(),
});

// GET /api/remarks/[id] - Get single remark
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid remark ID");

    const remark = await prisma.remark.findUnique({
      where: { id },
      select: { 
        id: true, 
        remarkName: true, 
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!remark) return NotFound('Remark not found');
    return Success(remark);
  } catch (error) {
    console.error("Get remark error:", error);
    return Error("Failed to fetch remark");
  }
}

// PATCH /api/remarks/[id] - Update remark
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid remark ID");

    const body = await req.json();
    const updateData = updateSchema.parse(body);

    if (Object.keys(updateData).length === 0) {
      return BadRequest("No valid fields to update");
    }

    const updated = await prisma.remark.update({
      where: { id },
      data: updateData,
      select: { 
        id: true, 
        remarkName: true, 
        createdAt: true,
        updatedAt: true
      }
    });

    return Success(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === 'P2025') return NotFound('Remark not found');
    if (error.code === 'P2002') {
      return Error('Remark already exists', 409);
    }
    console.error("Update remark error:", error);
    return Error("Failed to update remark");
  }
}

// DELETE /api/remarks/[id] - Delete remark
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid remark ID");

    await prisma.remark.delete({
      where: { id }
    });

    return Success({ message: "Remark deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') return NotFound('Remark not found');
    console.error("Delete remark error:", error);
    return Error("Failed to delete remark");
  }
}
